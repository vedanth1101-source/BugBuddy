package com.bugbuddy.service;

import com.bugbuddy.dto.BugRequest;
import com.bugbuddy.dto.gemini.AiAnalysisResult;
import com.bugbuddy.dto.gemini.GeminiResponse;
import com.bugbuddy.entity.Bug;
import com.bugbuddy.exception.AiServiceException;
import com.bugbuddy.exception.PayloadTooLargeException;
import com.bugbuddy.exception.ResourceNotFoundException;
import com.bugbuddy.repository.BugRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link BugService}.
 *
 * RestTemplate is mocked — no network calls are made.
 * BugRepository is mocked — no database is touched.
 * ObjectMapper is the real Jackson bean to test JSON parsing.
 */
@ExtendWith(MockitoExtension.class)
class BugServiceTest {

    @Mock
    private BugRepository  bugRepository;

    @Mock
    private RestTemplate   restTemplate;

    @InjectMocks
    private BugService bugService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Inject @Value fields manually since we are not loading a Spring context
        ReflectionTestUtils.setField(bugService, "objectMapper",    objectMapper);
        ReflectionTestUtils.setField(bugService, "geminiApiUrl",    "http://fake-gemini/generate");
        ReflectionTestUtils.setField(bugService, "geminiApiKey",    "fake-key");
    }

    // ─── analyzeBug ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("analyzeBug: cache HIT returns isCached=true without calling Gemini")
    void analyzeBug_cacheHit_returnsTransientCopyWithIsCachedTrue() {
        // Arrange
        Bug cached = Bug.builder()
                .id(1L)
                .errorText("NullPointerException at line 42")
                .language("Java")
                .aiExplanation("A null reference was dereferenced.")
                .suggestedFix("Add a null-check before accessing the field.")
                .isCached(false)   // stored record has isCached=false
                .createdAt(LocalDateTime.now())
                .build();

        when(bugRepository.findByErrorText(anyString())).thenReturn(Optional.of(cached));

        BugRequest request = new BugRequest();
        request.setErrorText("NullPointerException at line 42");
        request.setLanguage("Java");

        // Act
        Bug result = bugService.analyzeBug(request);

        // Assert
        assertThat(result.getIsCached()).isTrue();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getAiExplanation()).isEqualTo("A null reference was dereferenced.");

        // The stored record must NOT have been mutated or saved
        assertThat(cached.getIsCached()).isFalse();
        verify(bugRepository, never()).save(any());
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("analyzeBug: cache MISS calls Gemini and persists new Bug with isCached=false")
    void analyzeBug_cacheMiss_callsGeminiAndPersistsNewBug() throws Exception {
        // Arrange — no existing record
        when(bugRepository.findByErrorText(anyString())).thenReturn(Optional.empty());

        // Build a valid Gemini-shaped response
        String geminiJson = """
                {"explanation":"The variable was null.","suggestedFix":"Check for null before use."}
                """;
        GeminiResponse geminiResponse = buildGeminiResponse(geminiJson);

        when(restTemplate.postForEntity(anyString(), any(), eq(GeminiResponse.class)))
                .thenReturn(ResponseEntity.ok(geminiResponse));

        Bug savedBug = Bug.builder()
                .id(2L)
                .errorText("NullPointerException")
                .language("Java")
                .aiExplanation("The variable was null.")
                .suggestedFix("Check for null before use.")
                .isCached(false)
                .createdAt(LocalDateTime.now())
                .build();
        when(bugRepository.save(any(Bug.class))).thenReturn(savedBug);

        BugRequest request = new BugRequest();
        request.setErrorText("NullPointerException");
        request.setLanguage("Java");

        // Act
        Bug result = bugService.analyzeBug(request);

        // Assert
        assertThat(result.getIsCached()).isFalse();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getAiExplanation()).isEqualTo("The variable was null.");
        verify(bugRepository).save(any(Bug.class));
        verify(restTemplate).postForEntity(anyString(), any(), eq(GeminiResponse.class));
    }

    @Test
    @DisplayName("analyzeBug: errorText exceeding 5000 chars throws PayloadTooLargeException")
    void analyzeBug_payloadTooLarge_throwsPayloadTooLargeException() {
        // Arrange
        String hugeText = "x".repeat(5_001);
        BugRequest request = new BugRequest();
        request.setErrorText(hugeText);
        request.setLanguage("Java");

        // Act & Assert
        assertThatThrownBy(() -> bugService.analyzeBug(request))
                .isInstanceOf(PayloadTooLargeException.class)
                .hasMessageContaining("trim");

        verifyNoInteractions(bugRepository, restTemplate);
    }

    @Test
    @DisplayName("analyzeBug: default language is Java when language is blank")
    void analyzeBug_blankLanguage_defaultsToJava() throws Exception {
        when(bugRepository.findByErrorText(anyString())).thenReturn(Optional.empty());

        String geminiJson = """
                {"explanation":"Error desc.","suggestedFix":"Fix desc."}
                """;
        when(restTemplate.postForEntity(anyString(), any(), eq(GeminiResponse.class)))
                .thenReturn(ResponseEntity.ok(buildGeminiResponse(geminiJson)));

        Bug savedBug = Bug.builder()
                .id(3L).errorText("some error").language("Java")
                .aiExplanation("Error desc.").suggestedFix("Fix desc.")
                .isCached(false).createdAt(LocalDateTime.now()).build();
        when(bugRepository.save(any(Bug.class))).thenReturn(savedBug);

        BugRequest request = new BugRequest();
        request.setErrorText("some error");
        request.setLanguage(null);   // blank language

        Bug result = bugService.analyzeBug(request);
        assertThat(result.getLanguage()).isEqualTo("Java");
    }

    // ─── getBugById ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getBugById: existing ID returns the Bug")
    void getBugById_existingId_returnsBug() {
        Bug bug = Bug.builder().id(5L).errorText("err").build();
        when(bugRepository.findById(5L)).thenReturn(Optional.of(bug));

        Bug result = bugService.getBugById(5L);

        assertThat(result.getId()).isEqualTo(5L);
    }

    @Test
    @DisplayName("getBugById: unknown ID throws ResourceNotFoundException")
    void getBugById_unknownId_throwsResourceNotFoundException() {
        when(bugRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bugService.getBugById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ─── deleteBug ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteBug: existing ID deletes the Bug")
    void deleteBug_existingId_deletesBug() {
        Bug bug = Bug.builder().id(7L).errorText("err").build();
        when(bugRepository.findById(7L)).thenReturn(Optional.of(bug));

        bugService.deleteBug(7L);

        verify(bugRepository).delete(bug);
    }

    @Test
    @DisplayName("deleteBug: unknown ID throws ResourceNotFoundException without deleting")
    void deleteBug_unknownId_throwsResourceNotFoundException() {
        when(bugRepository.findById(77L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bugService.deleteBug(77L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(bugRepository, never()).delete(any());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Builds a minimal GeminiResponse whose extractText() returns the provided JSON string.
     */
    private GeminiResponse buildGeminiResponse(String innerJson) throws Exception {
        String wrapper = String.format("""
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [{ "text": %s }]
                      }
                    }
                  ]
                }
                """, objectMapper.writeValueAsString(innerJson.strip()));
        return objectMapper.readValue(wrapper, GeminiResponse.class);
    }
}
