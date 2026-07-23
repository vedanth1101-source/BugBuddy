package com.bugbuddy.controller;

import com.bugbuddy.dto.BugRequest;
import com.bugbuddy.entity.Bug;
import com.bugbuddy.service.BugService;
import com.bugbuddy.service.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing all BugBuddy API endpoints under the /api base path.
 *
 * Endpoints:
 *  POST   /api/bugs/analyze         — Submit error text for AI analysis (rate-limited, optionally auth-gated)
 *  GET    /api/bugs                 — List all bugs (paginated)
 *  GET    /api/bugs/search?q={kw}   — Full-text search across bug records
 *  GET    /api/bugs/{id}            — Fetch a single bug by ID
 *  DELETE /api/bugs/{id}            — Delete a single bug record
 *
 * CORS is configured globally in {@link com.bugbuddy.config.WebConfig}.
 * API key auth is handled by {@link com.bugbuddy.config.ApiKeyAuthFilter} (optional).
 * Rate limiting is enforced by {@link RateLimiterService} on the analyze endpoint.
 * Input validation is enforced by @Valid; errors are handled by
 * {@link com.bugbuddy.exception.GlobalExceptionHandler}.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class BugController {

    private final BugService        bugService;
    private final RateLimiterService rateLimiterService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/bugs/analyze
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts an error text submission, checks the cache, and returns an AI analysis.
     *
     * Rate limiting: {@link RateLimiterService} enforces the per-IP quota before any
     * business logic runs. Exceeding the quota returns HTTP 429.
     *
     * Optional auth: {@link com.bugbuddy.config.ApiKeyAuthFilter} intercepts this
     * endpoint when {@code BUGBUDDY_API_KEY} is configured, returning HTTP 401 on failure.
     *
     * @param request     JSON body: { "errorText": "...", "language": "Java" }
     *                    — errorText is required (@NotBlank enforced by @Valid)
     *                    — language is optional (defaults to "Java" in the service)
     * @param httpRequest the raw servlet request, used to extract client IP for rate limiting
     * @return 201 Created with the Bug entity (new record)
     *      or 200 OK     with the Bug entity (cache hit)
     */
    @PostMapping("/bugs/analyze")
    public ResponseEntity<Bug> analyzeBug(@Valid @RequestBody BugRequest request,
                                          HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        rateLimiterService.checkRateLimit(clientIp);

        log.info("POST /api/bugs/analyze | language={} | ip={}", request.getLanguage(), clientIp);
        Bug result = bugService.analyzeBug(request);

        // Return 200 if cached, 201 if newly created
        HttpStatus status = Boolean.TRUE.equals(result.getIsCached())
                ? HttpStatus.OK
                : HttpStatus.CREATED;

        return ResponseEntity.status(status).body(result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/bugs
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of all bug records, newest first.
     *
     * Query params (all optional):
     *  - page  (default 0)
     *  - size  (default 10)
     *
     * Example: GET /api/bugs?page=1&size=5
     *
     * @param page zero-based page index
     * @param size number of records per page
     * @return 200 OK with Page<Bug> JSON envelope
     */
    @GetMapping("/bugs")
    public ResponseEntity<Page<Bug>> getAllBugs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("GET /api/bugs | page={} size={}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Bug> bugs = bugService.getAllBugs(pageable);
        return ResponseEntity.ok(bugs);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/bugs/search?q={keyword}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Full-text search across error_text and ai_explanation columns.
     * Results ordered by MySQL relevance score (most relevant first).
     *
     * REQUIREMENT: The MySQL FULLTEXT index is now created automatically at
     * startup by {@link com.bugbuddy.config.DatabaseInitializer}.
     *
     * @param keyword the search term(s)
     * @return 200 OK with a List<Bug> of matching records
     */
    @GetMapping("/bugs/search")
    public ResponseEntity<List<Bug>> searchBugs(@RequestParam("q") String keyword) {
        log.info("GET /api/bugs/search | q='{}'", keyword);
        List<Bug> results = bugService.searchBugs(keyword);
        return ResponseEntity.ok(results);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/bugs/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetches a single bug record by its primary key.
     *
     * @param id the Bug's primary key (path variable)
     * @return 200 OK with the Bug entity
     * @throws com.bugbuddy.exception.ResourceNotFoundException → 404 if not found
     */
    @GetMapping("/bugs/{id}")
    public ResponseEntity<Bug> getBugById(@PathVariable Long id) {
        log.info("GET /api/bugs/{}", id);
        Bug bug = bugService.getBugById(id);
        return ResponseEntity.ok(bug);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE /api/bugs/{id}
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Deletes a single bug record by its primary key.
     *
     * Returns 404 if the record does not exist — ensures the caller gets
     * explicit feedback rather than a silent no-op 204.
     *
     * @param id the Bug's primary key (path variable)
     * @return 204 No Content on successful deletion
     * @throws com.bugbuddy.exception.ResourceNotFoundException → 404 if not found
     */
    @DeleteMapping("/bugs/{id}")
    public ResponseEntity<Void> deleteBug(@PathVariable Long id) {
        log.info("DELETE /api/bugs/{}", id);
        bugService.deleteBug(id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Resolves the real client IP address, respecting the X-Forwarded-For header
     * set by reverse proxies (Railway, Vercel, etc.).
     *
     * Takes only the first IP from X-Forwarded-For to handle chained proxies.
     * Falls back to RemoteAddr if the header is absent.
     *
     * @param request the incoming HTTP request
     * @return resolved client IP string
     */
    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
