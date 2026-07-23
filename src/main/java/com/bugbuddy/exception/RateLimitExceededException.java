package com.bugbuddy.exception;

/**
 * Thrown by {@link com.bugbuddy.service.RateLimiterService} when a client IP
 * exceeds the configured request quota within the sliding one-minute window.
 *
 * Mapped to HTTP 429 Too Many Requests by {@link GlobalExceptionHandler}.
 */
public class RateLimitExceededException extends RuntimeException {

    /**
     * @param message Human-readable quota-exceeded message surfaced to the caller.
     */
    public RateLimitExceededException(String message) {
        super(message);
    }
}
