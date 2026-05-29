package com.bugbuddy.exception;

/**
 * Thrown when the incoming errorText payload exceeds the maximum allowed length
 * (5,000 characters). This guard fires BEFORE any external network calls,
 * preventing oversized payloads from consuming Gemini AI token quota.
 *
 * Mapped to HTTP 400 Bad Request by {@link GlobalExceptionHandler}.
 */
public class PayloadTooLargeException extends RuntimeException {

    /**
     * @param message A human-readable description of the size violation.
     */
    public PayloadTooLargeException(String message) {
        super(message);
    }
}
