package com.bugbuddy.exception;

/**
 * Thrown when the Gemini AI service is unreachable, returns an error status,
 * times out, or returns a response that cannot be parsed into a valid
 * {@link com.bugbuddy.dto.gemini.AiAnalysisResult}.
 *
 * Mapped to HTTP 503 Service Unavailable by {@link GlobalExceptionHandler}.
 *
 * This exception intentionally wraps the original cause so the full
 * upstream error remains visible in server logs, while the client only
 * receives a clean, non-leaking error message.
 */
public class AiServiceException extends RuntimeException {

    /**
     * @param message A human-readable description safe to surface in logs.
     */
    public AiServiceException(String message) {
        super(message);
    }

    /**
     * @param message A human-readable description safe to surface in logs.
     * @param cause   The original upstream exception (network error, JSON parse failure, etc.)
     */
    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
