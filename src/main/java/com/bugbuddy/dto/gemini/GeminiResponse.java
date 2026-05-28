package com.bugbuddy.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Structural mapping for the Gemini generateContent API response body.
 *
 * Gemini REST API — response contract (simplified):
 * {
 *   "candidates": [
 *     {
 *       "content": {
 *         "parts": [
 *           { "text": "{ \"explanation\": \"...\", \"suggestedFix\": \"...\" }" }
 *         ]
 *       },
 *       "finishReason": "STOP"
 *     }
 *   ]
 * }
 *
 * The inner "text" value is itself a JSON string that we further parse
 * into {@link AiAnalysisResult}.
 *
 * @JsonIgnoreProperties(ignoreUnknown = true) is applied at every level
 * to safely absorb any additional Gemini response fields (usageMetadata,
 * safetyRatings, etc.) without breaking deserialization.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiResponse {

    private List<Candidate> candidates;

    /**
     * Extracts the raw text content from the first candidate's first part.
     * This is the string that contains our JSON-structured AI analysis.
     *
     * @return the raw text, or null if the response is empty / malformed
     */
    public String extractText() {
        if (candidates == null || candidates.isEmpty()) return null;
        Candidate first = candidates.get(0);
        if (first.getContent() == null) return null;
        List<Part> parts = first.getContent().getParts();
        if (parts == null || parts.isEmpty()) return null;
        return parts.get(0).getText();
    }

    // ── Nested structural classes ────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Candidate {
        private Content content;
        private String finishReason;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        private List<Part> parts;
        private String role;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        private String text;
    }
}
