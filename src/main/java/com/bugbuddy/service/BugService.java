package com.bugbuddy.service;

import com.bugbuddy.dto.BugRequest;
import com.bugbuddy.entity.Bug;
import com.bugbuddy.exception.ResourceNotFoundException;
import com.bugbuddy.repository.BugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Business logic layer for the BugBuddy application.
 *
 * ─── AI Stub Strategy ────────────────────────────────────────────────────────
 * The AI integration is intentionally stubbed in Phase 1.
 * When a bug is submitted:
 *   1. Perform an exact-match DB lookup by errorText.
 *   2. If found  → set isCached = true and return the existing record.
 *   3. If absent → build a new Bug entity with stub AI text, persist, and return.
 *
 * In Phase 2, replace the stub constants with a real AI client call
 * (e.g., Google Gemini, OpenAI GPT) inside the buildNewBug() method.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BugService {

    // ── Stub AI response constants (replace with real AI call in Phase 2) ───
    private static final String STUB_AI_EXPLANATION =
            "STUB: AI explanation goes here. In Phase 2 this will be replaced " +
            "with a real AI-generated explanation of the error.";

    private static final String STUB_SUGGESTED_FIX =
            "STUB: Suggested fix goes here. In Phase 2 this will be replaced " +
            "with a real AI-generated code fix or remediation steps.";

    // ── Default language fallback ────────────────────────────────────────────
    private static final String DEFAULT_LANGUAGE = "Java";

    private final BugRepository bugRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // ANALYZE — POST /api/bugs/analyze
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts an error submission, checks for an existing record (cache hit),
     * and either returns the cached result or creates a new one with stub AI text.
     *
     * @param request validated DTO containing errorText and optional language
     * @return the persisted (or fetched) Bug entity
     */
    @Transactional
    public Bug analyzeBug(BugRequest request) {
        String errorText = request.getErrorText().trim();
        String language  = resolveLanguage(request.getLanguage());

        log.info("Analyzing bug | language={} | errorText preview='{}'",
                language, preview(errorText));

        // ── Cache check: exact match by errorText ────────────────────────────
        return bugRepository.findByErrorText(errorText)
                .map(existingBug -> {
                    log.info("Cache HIT — returning existing Bug id={}", existingBug.getId());
                    existingBug.setIsCached(true);
                    // Persist the isCached flag update
                    return bugRepository.save(existingBug);
                })
                .orElseGet(() -> {
                    log.info("Cache MISS — creating new Bug record with stub AI data");
                    Bug newBug = buildNewBug(errorText, language);
                    Bug saved = bugRepository.save(newBug);
                    log.info("Saved new Bug id={}", saved.getId());
                    return saved;
                });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL (paginated) — GET /api/bugs
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns a paginated view of all Bug records.
     *
     * @param pageable Spring Data pageable (page index + page size + optional sort)
     * @return Page<Bug> — includes content list, total count, page metadata
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
     * Delegates to the native FULLTEXT MySQL query in the repository.
     * Results are ordered by relevance score descending.
     *
     * @param keyword the search term
     * @return list of matching Bug records
     */
    public List<Bug> searchBugs(String keyword) {
        log.debug("Full-text search | keyword='{}'", keyword);
        return bugRepository.fullTextSearch(keyword);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET BY ID — GET /api/bugs/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetches a single Bug by its primary key.
     *
     * @param id the Bug's primary key
     * @return the Bug entity
     * @throws ResourceNotFoundException if no Bug with the given id exists
     */
    public Bug getBugById(Long id) {
        log.debug("Fetching Bug by id={}", id);
        return bugRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug", "id", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Builds a new Bug entity populated with stub AI text.
     * Replace the stub constants here in Phase 2 with a real AI client call.
     *
     * @param errorText sanitized error text
     * @param language  resolved programming language
     * @return unsaved Bug entity ready for persistence
     */
    private Bug buildNewBug(String errorText, String language) {
        return Bug.builder()
                .errorText(errorText)
                .language(language)
                .aiExplanation(STUB_AI_EXPLANATION)
                .suggestedFix(STUB_SUGGESTED_FIX)
                .isCached(false)
                .build();
    }

    /**
     * Resolves the language from the request, defaulting to "Java" if absent or blank.
     */
    private String resolveLanguage(String language) {
        return StringUtils.hasText(language) ? language.trim() : DEFAULT_LANGUAGE;
    }

    /**
     * Returns a safe preview of a long string for log output.
     */
    private String preview(String text) {
        return text.length() > 80 ? text.substring(0, 80) + "…" : text;
    }
}
