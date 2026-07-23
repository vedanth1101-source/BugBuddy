package com.bugbuddy.controller;

import com.bugbuddy.entity.Bug;
import com.bugbuddy.exception.ResourceNotFoundException;
import com.bugbuddy.service.BugService;
import com.bugbuddy.service.RateLimiterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice tests for {@link BugController} using {@code @WebMvcTest}.
 *
 * Only the web layer is loaded (no full Spring context).
 * BugService and RateLimiterService are mocked via @MockBean.
 */
@WebMvcTest(BugController.class)
@ActiveProfiles("test")
class BugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BugService        bugService;

    @MockBean
    private RateLimiterService rateLimiterService;

    // ── Helper bug fixture ───────────────────────────────────────────────────
    private Bug sampleBug(boolean isCached) {
        return Bug.builder()
                .id(1L)
                .errorText("NullPointerException at line 42")
                .language("Java")
                .aiExplanation("A null reference was accessed.")
                .suggestedFix("Add a null-check before accessing the object.")
                .isCached(isCached)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ─── POST /api/bugs/analyze ──────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/bugs/analyze: new analysis returns 201 Created")
    void analyzeBug_newAnalysis_returns201() throws Exception {
        Bug newBug = sampleBug(false);
        when(bugService.analyzeBug(any())).thenReturn(newBug);

        mockMvc.perform(post("/api/bugs/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("errorText", "NullPointerException at line 42", "language", "Java"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.isCached").value(false));
    }

    @Test
    @DisplayName("POST /api/bugs/analyze: cache hit returns 200 OK")
    void analyzeBug_cacheHit_returns200() throws Exception {
        Bug cachedBug = sampleBug(true);
        when(bugService.analyzeBug(any())).thenReturn(cachedBug);

        mockMvc.perform(post("/api/bugs/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("errorText", "NullPointerException at line 42", "language", "Java"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCached").value(true));
    }

    @Test
    @DisplayName("POST /api/bugs/analyze: blank errorText returns 400 Bad Request")
    void analyzeBug_blankErrorText_returns400() throws Exception {
        mockMvc.perform(post("/api/bugs/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("errorText", "", "language", "Java"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verifyNoInteractions(bugService);
    }

    // ─── GET /api/bugs ───────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bugs: returns 200 with paginated content")
    void getAllBugs_returns200WithPage() throws Exception {
        PageImpl<Bug> page = new PageImpl<>(List.of(sampleBug(false)));
        when(bugService.getAllBugs(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/bugs").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    // ─── GET /api/bugs/{id} ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/bugs/{id}: existing ID returns 200")
    void getBugById_existingId_returns200() throws Exception {
        when(bugService.getBugById(1L)).thenReturn(sampleBug(false));

        mockMvc.perform(get("/api/bugs/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("GET /api/bugs/{id}: unknown ID returns 404")
    void getBugById_unknownId_returns404() throws Exception {
        when(bugService.getBugById(99L)).thenThrow(new ResourceNotFoundException("Bug", "id", 99L));

        mockMvc.perform(get("/api/bugs/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // ─── DELETE /api/bugs/{id} ───────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/bugs/{id}: existing ID returns 204 No Content")
    void deleteBug_existingId_returns204() throws Exception {
        doNothing().when(bugService).deleteBug(1L);

        mockMvc.perform(delete("/api/bugs/1"))
                .andExpect(status().isNoContent());

        verify(bugService).deleteBug(1L);
    }

    @Test
    @DisplayName("DELETE /api/bugs/{id}: unknown ID returns 404")
    void deleteBug_unknownId_returns404() throws Exception {
        doThrow(new ResourceNotFoundException("Bug", "id", 99L))
                .when(bugService).deleteBug(99L);

        mockMvc.perform(delete("/api/bugs/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
