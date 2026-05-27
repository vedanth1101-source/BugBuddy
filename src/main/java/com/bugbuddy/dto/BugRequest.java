package com.bugbuddy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for the POST /api/bugs/analyze request body.
 *
 * Bean Validation annotations here are the authoritative validation layer —
 * they are enforced by @Valid in the controller before reaching the service.
 */
@Data
public class BugRequest {

    /**
     * The raw error text or stack trace submitted by the user.
     * Must not be null or blank.
     */
    @NotBlank(message = "errorText must not be blank")
    private String errorText;

    /**
     * The programming language the error originates from.
     * Defaults to "Java" at the service layer if not supplied.
     */
    private String language;
}
