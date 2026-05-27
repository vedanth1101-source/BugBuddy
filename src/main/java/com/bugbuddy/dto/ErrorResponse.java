package com.bugbuddy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized JSON error response returned by GlobalExceptionHandler.
 *
 * All error responses from the API follow this envelope structure for consistency:
 * {
 *   "timestamp": "2024-...",
 *   "status": 400,
 *   "error": "Bad Request",
 *   "message": "...",
 *   "path": "/api/bugs/analyze",
 *   "fieldErrors": { "errorText": "must not be blank" }   // optional
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /** UTC timestamp when the error occurred. */
    private LocalDateTime timestamp;

    /** HTTP status code (e.g. 400, 404, 500). */
    private int status;

    /** HTTP status reason phrase (e.g. "Bad Request"). */
    private String error;

    /** Human-readable description of the error. */
    private String message;

    /** The request URI that caused the error. */
    private String path;

    /**
     * Field-level validation errors.
     * Key = field name, Value = validation message.
     * Only populated for MethodArgumentNotValidException (HTTP 400 validation failures).
     */
    private Map<String, String> fieldErrors;
}
