package com.bugbuddy.service;

import com.bugbuddy.dto.BugRequest;
import com.bugbuddy.dto.gemini.AiAnalysisResult;
import com.bugbuddy.dto.gemini.GeminiRequest;
import com.bugbuddy.dto.gemini.GeminiResponse;
import com.bugbuddy.entity.Bug;
import com.bugbuddy.exception.AiServiceException;
import com.bugbuddy.exception.PayloadTooLargeException;
import com.bugbuddy.exception.ResourceNotFoundException;
import com.bugbuddy.exception.ServiceUnavailableException;
import com.bugbuddy.repository.BugRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * Business logic layer for the BugBuddy application.
 *
 * ─── AI Integration Flow ──────────────────────────────────────────────────────
 *  1. CACHE CHECK  — Exact-match lookup by errorText in MySQL.
 *                    Hit  → mark isCached=true, persist, return immediately.
 *                    Miss → proceed to Gemini.
 *
 *  2. AI CALL      — Structured POST to the Gemini generateContent endpoint.
 *                    URL built as: geminiApiUrl + "?key=" + geminiApiKey
 *                    Both values are injected via @Value from application.properties.
 *                    No credentials are hardcoded in source.
 *
 *  3. PARSE        — Raw text extracted from candidates[0].content.parts[0].text,
 *                    stripped of optional markdown fences, deserialized into
 *                    AiAnalysisResult { explanation, suggestedFix }.
 *
 *  4. PERSIST      — New Bug entity built from parsed fields, saved (isCached=false).
 *
 *  5. ERROR GUARD  — Network errors, HTTP 4xx/5xx, and JSON parse failures are
 *                    all caught and rethrown as AiServiceException → HTTP 503.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BugService {

    // ── Injected Spring beans ────────────────────────────────────────────────
    private final BugRepository bugRepository;
    private final RestTemplate  restTemplate;   // configured in AppConfig (5s/30s timeouts)
    private final ObjectMapper  objectMapper;   // Spring Boot auto-configures this bean

    // ── Gemini credentials — injected from application.properties ────────────
    // These are NEVER hardcoded. The @Value annotation reads them at startup.
    // gemini.api.url  = https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
    // gemini.api.key  = <your key>
    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // ── Constants ────────────────────────────────────────────────────────────
    private static final String DEFAULT_LANGUAGE     = "Java";

    /**
     * Maximum characters accepted in the errorText payload.
     * This guard fires BEFORE any cache lookup or network call to prevent
     * oversized inputs from consuming Gemini AI token quota.
     */
    private static final int MAX_ERROR_TEXT_LENGTH = 5_000;

    /**
     * Structured prompt template that instructs Gemini to return a clean JSON
     * object with exactly two fields: "explanation" and "suggestedFix".
     * %s[0] = errorText, %s[1] = language.
     */
    private static final String PROMPT_TEMPLATE =
            "You are a principal software engineer. Analyze the following runtime crash or error trace. " +
            "Provide a clear, plain-English explanation of exactly why it happened in 3-4 sentences. " +
            "Then, provide a concrete, step-by-step code fix or mitigation strategy.\n\n" +
            "Error Log: %s\n" +
            "Programming Language Context: %s\n\n" +
            "CRITICAL: You must return your response inside a clean, unquoted, valid JSON object " +
            "matching this exact structural blueprint:\n" +
            "{\n" +
            "  \"explanation\": \"your explanation text here\",\n" +
            "  \"suggestedFix\": \"your code fix details here\"\n" +
            "}";

    // ─────────────────────────────────────────────────────────────────────────
    // ANALYZE — POST /api/bugs/analyze
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts an error submission, performs a MySQL cache check, and either
     * returns a cached result or calls Gemini to generate a fresh analysis.
     *
     * @param request validated DTO (errorText required, language optional)
     * @return persisted Bug entity; isCached=true on hit, false on miss
     * @throws AiServiceException if the Gemini call fails for any reason
     */
    @Transactional
    public Bug analyzeBug(BugRequest request) {
        String errorText = request.getErrorText().trim();
        String language  = resolveLanguage(request.getLanguage());

        // ── Step 0: Payload size guard ───────────────────────────────────────
        // Enforce BEFORE cache check and BEFORE any network call.
        // Protects Gemini token quota and prevents slow/expensive processing.
        if (errorText.length() > MAX_ERROR_TEXT_LENGTH) {
            log.warn("Payload rejected — errorText length={} exceeds limit={}",
                    errorText.length(), MAX_ERROR_TEXT_LENGTH);
            throw new PayloadTooLargeException(
                    "Error text too long. Please trim your stack trace."
            );
        }

        log.info("Analyzing bug | language={} | errorText preview='{}'",
                language, preview(errorText));

        // ── Step 1: Cache check ──────────────────────────────────────────────
        return bugRepository.findByErrorText(errorText)
                .map(existingBug -> {
                    log.info("Cache HIT — returning existing Bug id={}", existingBug.getId());
                    // Return a transient copy with isCached=true.
                    // We intentionally do NOT call save() here — isCached is a
                    // per-response signal for the caller, NOT a persistent column
                    // attribute. Mutating and saving the stored record on every
                    // cache hit would corrupt the record's historical isCached value.
                    return Bug.builder()
                            .id(existingBug.getId())
                            .errorText(existingBug.getErrorText())
                            .language(existingBug.getLanguage())
                            .aiExplanation(existingBug.getAiExplanation())
                            .suggestedFix(existingBug.getSuggestedFix())
                            .isCached(true)
                            .createdAt(existingBug.getCreatedAt())
                            .build();
                })
                .orElseGet(() -> {
                    // ── Step 2: Cache miss → call Gemini ────────────────────
                    log.info("Cache MISS — invoking Gemini AI for fresh analysis");
                    AiAnalysisResult aiResult = callGeminiApi(errorText, language);

                    // ── Step 3: Persist and return ───────────────────────────
                    Bug newBug = buildBugFromAiResult(errorText, language, aiResult);
                    Bug saved  = bugRepository.save(newBug);
                    log.info("Saved new Bug id={} from AI analysis", saved.getId());
                    return saved;
                });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL (paginated) — GET /api/bugs
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns a paginated view of all Bug records, ordered newest-first.
     */
    public Page<Bug> getAllBugs(Pageable pageable) {
        log.debug("Fetching all bugs | page={} size={}",
                pageable.getPageNumber(), pageable.getPageSize());
        return bugRepository.findAll(pageable);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FULLTEXT SEARCH — GET /api/bugs/search?q={keyword}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Delegates to the native FULLTEXT MySQL query in BugRepository.
     * Results are ordered by MySQL relevance score descending.
     */
    public List<Bug> searchBugs(String keyword) {
        log.debug("Full-text search | keyword='{}'", keyword);
        return bugRepository.fullTextSearch(keyword);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET BY ID — GET /api/bugs/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetches a single Bug by primary key.
     *
     * @throws ResourceNotFoundException → HTTP 404 if no matching record exists
     */
    public Bug getBugById(Long id) {
        log.debug("Fetching Bug by id={}", id);
        return bugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE — DELETE /api/bugs/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Deletes a single Bug by primary key.
     *
     * Verifies existence first so that a 404 is returned for unknown IDs rather
     * than silently returning 204 for a no-op delete.
     *
     * @param id the Bug's primary key
     * @throws ResourceNotFoundException → HTTP 404 if no matching record exists
     */
    @Transactional
    public void deleteBug(Long id) {
        log.info("Deleting Bug id={}", id);
        Bug bug = bugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", id));
        bugRepository.delete(bug);
        log.info("Bug id={} deleted successfully", id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private — Gemini API integration
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Constructs and dispatches the HTTP POST request to the Gemini
     * generateContent endpoint, then parses the structured JSON response.
     *
     * URL construction:
     *   String targetUrl = geminiApiUrl + "?key=" + geminiApiKey;
     *
     * geminiApiUrl is injected from application.properties:
     *   gemini.api.url = https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
     *
     * The full path — including /v1beta/ and /models/gemini-1.5-flash — lives
     * entirely inside application.properties. No path segment is hardcoded here.
     * The API key is appended as a query parameter per Gemini REST API convention.
     *
     * @param errorText raw error text to analyze
     * @param language  programming language context
     * @return parsed {@link AiAnalysisResult} with explanation and suggestedFix
     * @throws AiServiceException on any network, HTTP, or parse failure
     */
    private AiAnalysisResult callGeminiApi(String errorText, String language) {

        // ── 1. Build the prompt and request body ─────────────────────────────
        String prompt = String.format(PROMPT_TEMPLATE, errorText, language);
        GeminiRequest requestBody = GeminiRequest.of(prompt);

        // ── 2. Construct the target URL from injected properties only ─────────
        //       No path segment is hardcoded here. The full model path
        //       (.../v1beta/models/gemini-1.5-flash:generateContent) comes
        //       entirely from the gemini.api.url property value.
        String targetUrl = geminiApiUrl + "?key=" + geminiApiKey;

        // ── 3. Set request headers ───────────────────────────────────────────
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<GeminiRequest> httpEntity = new HttpEntity<>(requestBody, headers);

        try {
            // URL logged without key for security
            log.debug("POST → Gemini | url={}", geminiApiUrl);

            // ── 4. Dispatch via the timeout-configured RestTemplate bean ──────
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(
                    targetUrl,
                    httpEntity,
                    GeminiResponse.class
            );

            // ── 5. Validate HTTP response ────────────────────────────────────
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AiServiceException(
                    "Gemini API returned a non-2xx response: " + response.getStatusCode()
                );
            }

            // ── 6. Extract text from candidates[0].content.parts[0].text ─────
            String rawText = response.getBody().extractText();
            if (rawText == null || rawText.isBlank()) {
                throw new AiServiceException(
                    "Gemini API returned an empty content block."
                );
            }

            log.debug("Gemini raw response received (length={})", rawText.length());

            // ── 7. Parse the embedded JSON from the AI text ──────────────────
            return parseAiJsonResponse(rawText);

        } catch (ResourceAccessException ex) {
            // Network unreachable, connection refused, OR read timeout exceeded (10s SLA).
            // All three cases mean the AI service is not available to serve this request.
            log.error("Gemini unreachable / timeout: {}", ex.getMessage(), ex);
            throw new ServiceUnavailableException(
                "AI service unavailable. Please try again.", ex
            );
        } catch (HttpClientErrorException ex) {
            // 401 / 403 — invalid or expired API key → service operationally unavailable.
            // Any other 4xx (e.g. 400 bad request) is a request-level problem, not
            // an availability problem, so it remains AiServiceException.
            int status = ex.getStatusCode().value();
            if (status == 401 || status == 403) {
                log.error("Gemini auth error [{}] — check API key in application.properties", status, ex);
                throw new ServiceUnavailableException(
                    "AI service unavailable. Please try again.", ex
                );
            }
            log.error("Gemini client error [{}]: {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new AiServiceException(
                "The AI service rejected the request (HTTP " + ex.getStatusCode() +
                "). Verify the API key and model name in application.properties.", ex
            );
        } catch (HttpServerErrorException ex) {
            // 5xx — Gemini-side failure
            log.error("Gemini server error [{}]: {}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new AiServiceException(
                "The AI service encountered an internal error (HTTP " + ex.getStatusCode() +
                "). Please try again later.", ex
            );
        } catch (AiServiceException | ServiceUnavailableException ex) {
            throw ex; // already wrapped — do not double-wrap
        } catch (Exception ex) {
            log.error("Unexpected error during Gemini call: {}", ex.getMessage(), ex);
            throw new AiServiceException(
                "An unexpected error occurred while contacting the AI service.", ex
            );
        }
    }

    /**
     * Parses the raw text from Gemini into a typed {@link AiAnalysisResult}.
     *
     * Gemini occasionally wraps its JSON in markdown fences (```json ... ```).
     * This method strips those before Jackson deserialization to ensure robust
     * parsing regardless of Gemini's output formatting.
     *
     * @param rawText the text string extracted from the Gemini response envelope
     * @return populated AiAnalysisResult
     * @throws AiServiceException if the text is not valid JSON or fields are missing
     */
    private AiAnalysisResult parseAiJsonResponse(String rawText) {
        String cleaned = rawText.trim();

        // Strip markdown code fences: ```json ... ``` or ``` ... ```
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?\\s*", "");
            int lastFence = cleaned.lastIndexOf("```");
            if (lastFence != -1) {
                cleaned = cleaned.substring(0, lastFence).trim();
            }
        }

        try {
            AiAnalysisResult result = objectMapper.readValue(cleaned, AiAnalysisResult.class);

            // Validate both required fields are present and non-empty
            if (!StringUtils.hasText(result.getExplanation())) {
                throw new AiServiceException(
                    "Gemini response was missing the 'explanation' field."
                );
            }
            if (!StringUtils.hasText(result.getSuggestedFix())) {
                throw new AiServiceException(
                    "Gemini response was missing the 'suggestedFix' field."
                );
            }

            return result;

        } catch (JsonProcessingException ex) {
            log.error("JSON parse failure. Cleaned Gemini text: {}", cleaned, ex);
            throw new AiServiceException(
                "The AI service returned a response in an unexpected format. Please try again.", ex
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private — entity builder and utility helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Builds a new Bug entity from a parsed AI result.
     * Maps AiAnalysisResult.explanation → Bug.aiExplanation
     *      AiAnalysisResult.suggestedFix → Bug.suggestedFix
     */
    private Bug buildBugFromAiResult(String errorText, String language, AiAnalysisResult aiResult) {
        return Bug.builder()
                .errorText(errorText)
                .language(language)
                .aiExplanation(aiResult.getExplanation())
                .suggestedFix(aiResult.getSuggestedFix())
                .isCached(false)
                .build();
    }

    /**
     * Resolves the programming language, defaulting to "Java" if blank or absent.
     */
    private String resolveLanguage(String language) {
        return StringUtils.hasText(language) ? language.trim() : DEFAULT_LANGUAGE;
    }

    /**
     * Returns a safe 80-char preview of a string for log lines.
     * Prevents multi-line stack traces from flooding log output.
     */
    private String preview(String text) {
        return text.length() > 80 ? text.substring(0, 80) + "…" : text;
    }
}
