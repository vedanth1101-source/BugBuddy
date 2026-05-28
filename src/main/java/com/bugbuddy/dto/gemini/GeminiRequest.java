package com.bugbuddy.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

/**
 * Structural mapping for the Gemini generateContent API request body.
 *
 * Gemini REST API — POST body contract:
 * {
 *   "contents": [
 *     {
 *       "parts": [
 *         { "text": "..." }
 *       ]
 *     }
 *   ]
 * }
 *
 * Jackson serializes this into the correct JSON structure when passed
 * to RestTemplate.postForEntity().
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiRequest {

    private List<Content> contents;

    /**
     * Factory method — builds a single-turn user prompt request.
     *
     * @param promptText the fully assembled prompt string
     * @return a GeminiRequest ready for serialization
     */
    public static GeminiRequest of(String promptText) {
        Part part = new Part();
        part.setText(promptText);

        Content content = new Content();
        content.setParts(List.of(part));

        GeminiRequest req = new GeminiRequest();
        req.setContents(List.of(content));
        return req;
    }

    // ── Nested structural classes ────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Part {
        private String text;
    }
}
