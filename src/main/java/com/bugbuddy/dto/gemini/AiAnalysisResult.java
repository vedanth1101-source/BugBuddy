package com.bugbuddy.dto.gemini;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

/**
 * Represents the structured JSON payload that Gemini is instructed to return
 * inside the text content of its response.
 *
 * Expected JSON structure (embedded within the Gemini text field):
 * {
 *   "explanation": "Plain-English description of why the error occurred...",
 *   "suggestedFix": "Step-by-step fix or mitigation strategy..."
 * }
 *
 * Jackson deserializes this after the raw Gemini text is extracted from
 * {@link GeminiResponse#extractText()} and stripped of any markdown fences.
 */
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAnalysisResult {

    /**
     * Plain-English explanation of why the error occurred.
     * Maps to Bug.aiExplanation.
     */
    private String explanation;

    /**
     * Concrete, step-by-step fix or mitigation strategy.
     * Maps to Bug.suggestedFix.
     */
    private String suggestedFix;
}
