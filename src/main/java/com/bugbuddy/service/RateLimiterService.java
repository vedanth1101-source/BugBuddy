package com.bugbuddy.service;

import com.bugbuddy.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple per-IP rate limiter using a one-minute sliding window.
 *
 * ── Design ──────────────────────────────────────────────────────────────────
 * • A {@link ConcurrentHashMap} maps each client IP → request count.
 * • A single-threaded {@link ScheduledExecutorService} clears the map every
 *   60 seconds, resetting all counters atomically.
 * • No external libraries (Bucket4j, Guava, etc.) are required.
 * • Thread-safe via {@link AtomicInteger} increments — no synchronized blocks.
 *
 * ── Limits ──────────────────────────────────────────────────────────────────
 * Configurable via {@code bugbuddy.rate-limit.requests-per-minute} (default 10).
 * Applied exclusively to POST /api/bugs/analyze to protect the Gemini AI quota.
 * ────────────────────────────────────────────────────────────────────────────
 */
@Service
@Slf4j
public class RateLimiterService {

    @Value("${bugbuddy.rate-limit.requests-per-minute:10}")
    private int requestsPerMinute;

    /** IP → request count within the current one-minute window. */
    private final ConcurrentHashMap<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    /** Background thread that resets all counters once per minute. */
    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "rate-limiter-reset");
                t.setDaemon(true);   // dies with the JVM — no shutdown hook needed
                return t;
            });

    public RateLimiterService() {
        // Clear all IP counters at the start of each new minute window.
        scheduler.scheduleAtFixedRate(
                () -> {
                    int size = requestCounts.size();
                    requestCounts.clear();
                    log.debug("Rate-limiter window reset — cleared {} IP entries", size);
                },
                1, 1, TimeUnit.MINUTES
        );
    }

    /**
     * Increments the counter for the given client IP and throws
     * {@link RateLimitExceededException} if the per-minute quota is exceeded.
     *
     * @param clientIp extracted from X-Forwarded-For or RemoteAddr
     * @throws RateLimitExceededException when the caller is over quota
     */
    public void checkRateLimit(String clientIp) {
        AtomicInteger counter = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        int count = counter.incrementAndGet();

        if (count > requestsPerMinute) {
            log.warn("Rate limit exceeded | IP={} | count={}/{}", clientIp, count, requestsPerMinute);
            throw new RateLimitExceededException(
                    "Rate limit exceeded. Maximum " + requestsPerMinute +
                    " requests per minute allowed. Please wait before retrying."
            );
        }

        log.debug("Rate check OK | IP={} | count={}/{}", clientIp, count, requestsPerMinute);
    }
}
