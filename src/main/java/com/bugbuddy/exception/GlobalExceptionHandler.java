package com.bugbuddy.exception;

import com.bugbuddy.dto.ErrorResponse;
import com.bugbuddy.exception.AiServiceException;
import com.bugbuddy.exception.PayloadTooLargeException;
import com.bugbuddy.exception.RateLimitExceededException;
import com.bugbuddy.exception.ResourceNotFoundException;
import com.bugbuddy.exception.ServiceUnavailableException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centralized exception handler for all BugBuddy REST controllers.
 *
 * Intercepts exceptions thrown from any @RestController and converts them
 * into consistent {@link ErrorResponse} JSON payloads. This prevents raw
 * Spring error pages or stack traces from leaking to the client.
 *
 * Handled cases:
 *  - MethodArgumentNotValidException  → 400 (Bean Validation failures)
 *  - PayloadTooLargeException         → 400 (errorText exceeds 5,000 chars)
 *  - ResourceNotFoundException        → 404 (entity not found)
 *  - ServiceUnavailableException      → 503 (Gemini timeout or auth failure)
 *  - AiServiceException               → 503 (general Gemini call failures)
 *  - DataAccessException              → 503 (MySQL / JPA layer errors)
 *  - Exception (catch-all)            → 500 (unexpected errors)
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────────────────────────────────────
    // 400 — Bean Validation failures (@Valid on request body)
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        // Collect all field-level error messages into a map
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid value",
                        // If the same field has multiple errors, keep the first
                        (existing, replacement) -> existing
                ));

        log.warn("Validation failed for request [{}]: {}", request.getRequestURI(), fieldErrors);

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Request validation failed. Check 'fieldErrors' for details.")
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ───────────────────────────────────────────────────────────────────────
    // 400 — Payload too large (errorText exceeds 5,000 character limit)
    // ───────────────────────────────────────────────────────────────────────

    @ExceptionHandler(PayloadTooLargeException.class)
    public ResponseEntity<ErrorResponse> handlePayloadTooLarge(
            PayloadTooLargeException ex,
            HttpServletRequest request) {

        log.warn("Payload too large on request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())   // "Error text too long. Please trim your stack trace."
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 429 — Rate limit exceeded (too many requests from one IP per minute)
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitExceeded(
            RateLimitExceededException ex,
            HttpServletRequest request) {

        log.warn("Rate limit exceeded on request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 404 — Resource not found
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {

        log.warn("Resource not found: {} | Path: {}", ex.getMessage(), request.getRequestURI());

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    // ───────────────────────────────────────────────────────────────────────
    // 503 — Gemini service unavailable (timeout or invalid API key)
    // Returns the EXACT client-facing JSON payload required by the contract:
    //   { "error": "AI service unavailable. Please try again." }
    // ───────────────────────────────────────────────────────────────────────

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Map<String, String>> handleServiceUnavailable(
            ServiceUnavailableException ex,
            HttpServletRequest request) {

        // Full cause logged internally; client receives only the safe message.
        log.error("AI service unavailable on request [{}]: {}",
                request.getRequestURI(), ex.getMessage(), ex);

        // Returns the exact minimal JSON payload specified:
        // { "error": "AI service unavailable. Please try again." }
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "AI service unavailable. Please try again."));
    }

    // ───────────────────────────────────────────────────────────────────────
    // 503 — General AI call failure (parse errors, empty responses, 5xx from Gemini)
    // ───────────────────────────────────────────────────────────────────────

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiServiceError(
            AiServiceException ex,
            HttpServletRequest request) {

        log.error("AI service error on request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message("AI Triage Service temporarily unavailable. Please try again later.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 503 — Database / JPA layer errors
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseErrors(
            DataAccessException ex,
            HttpServletRequest request) {

        // Log the full stack trace internally; do NOT expose raw SQL errors to client
        log.error("Database error on request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.SERVICE_UNAVAILABLE.value())
                .error(HttpStatus.SERVICE_UNAVAILABLE.getReasonPhrase())
                .message("A database error occurred. Please try again later.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 500 — Catch-all for any unhandled exceptions
    // ─────────────────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericErrors(
            Exception ex,
            HttpServletRequest request) {

        log.error("Unhandled exception on request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred. Please contact support.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
