package com.bugbuddy.controller;

import com.bugbuddy.dto.BugRequest;
import com.bugbuddy.entity.Bug;
import com.bugbuddy.service.BugService;
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
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;

/**
 * REST controller exposing all BugBuddy API endpoints under the /api base path.
 *
 * Endpoints:
 *  POST   /api/bugs/analyze         — Submit error text for AI analysis
 *  GET    /api/bugs                 — List all bugs (paginated)
 *  GET    /api/bugs/search?q={kw}   — Full-text search across bug records
 *  GET    /api/bugs/{id}            — Fetch a single bug by ID
 *
 * CORS is configured globally in {@link com.bugbuddy.config.WebConfig}.
 * Input validation is enforced by @Valid; errors are handled by
 * {@link com.bugbuddy.exception.GlobalExceptionHandler}.
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class BugController {

    private final BugService bugService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/bugs/analyze
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Accepts an error text submission, checks the cache, and returns an AI analysis.
     *
     * @param request  JSON body: { "errorText": "...", "language": "Java" }
     *                 — errorText is required (@NotBlank enforced by @Valid)
     *                 — language is optional (defaults to "Java" in the service)
     * @return 201 Created with the Bug entity (new record)
     *      or 200 OK     with the Bug entity (cache hit)
     */
    @PostMapping("/bugs/analyze")
    public ResponseEntity<Bug> analyzeBug(@Valid @RequestBody BugRequest request) {
        log.info("POST /api/bugs/analyze | language={}", request.getLanguage());
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
     * Query params (all optional, Spring Data binds them automatically):
     *  - page  (default 0)
     *  - size  (default 10)
     *  - sort  (e.g., sort=createdAt,desc)
     *
     * Example: GET /api/bugs?page=1&size=5&sort=createdAt,desc
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
     * REQUIREMENT: The MySQL FULLTEXT index must exist before calling this endpoint.
     * Run once: ALTER TABLE bugs ADD FULLTEXT INDEX ft_bug_search (error_text, ai_explanation);
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
}
