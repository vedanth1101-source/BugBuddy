package com.bugbuddy.exception;

/**
 * Thrown when the Gemini AI service is operationally unavailable — specifically when:
 *   - The HTTP call times out (connect or read timeout exceeded)
 *   - The API key is invalid or unauthorized (HTTP 401 / 403)
 *
 * Distinct from {@link AiServiceException}, which covers general AI call failures
 * (parse errors, empty responses, server-side 5xx). This exception signals a
 * hard infrastructure condition that warrants a clean HTTP 503 to the client.
 *
 * Mapped to HTTP 503 Service Unavailable by {@link GlobalExceptionHandler}.
 */
public class ServiceUnavailableException extends RuntimeException {

    /**
     * @param message A safe, non-leaking description for logs and the client response.
     */
    public ServiceUnavailableException(String message) {
        super(message);
    }

    /**
     * @param message A safe, non-leaking description for logs and the client response.
     * @param cause   The original upstream exception (timeout, auth rejection, etc.)
     */
    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
