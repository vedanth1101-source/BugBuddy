package com.bugbuddy.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;

/**
 * Optional API key authentication filter for POST /api/bugs/analyze.
 *
 * ── Activation ───────────────────────────────────────────────────────────────
 * Set the {@code BUGBUDDY_API_KEY} environment variable (or
 * {@code bugbuddy.api.key} in application.properties) to a non-blank value.
 *
 * If the property is blank (the default), this filter is a pass-through —
 * all existing dev/test setups continue to work without any code change.
 *
 * ── Usage ────────────────────────────────────────────────────────────────────
 * When active, every POST to /api/bugs/analyze must include the header:
 *
 *   X-API-Key: <your-configured-key>
 *
 * A missing or incorrect key returns HTTP 401 Unauthorized with a JSON body:
 *   { "error": "Unauthorized. A valid X-API-Key header is required." }
 *
 * All other endpoints (GET /api/bugs, DELETE /api/bugs/{id}, etc.) are
 * intentionally left unprotected — only the Gemini quota-consuming endpoint
 * requires authentication.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component
@Order(1)
@Slf4j
public class ApiKeyAuthFilter implements Filter {

    /** The header name clients must include. */
    private static final String API_KEY_HEADER = "X-API-Key";

    /** The only path that requires authentication. */
    private static final String PROTECTED_PATH = "/api/bugs/analyze";

    @Value("${bugbuddy.api.key:}")
    private String configuredApiKey;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  httpReq  = (HttpServletRequest)  request;
        HttpServletResponse httpResp = (HttpServletResponse) response;

        boolean isProtectedEndpoint =
                "POST".equalsIgnoreCase(httpReq.getMethod()) &&
                PROTECTED_PATH.equals(httpReq.getServletPath());

        if (isProtectedEndpoint && StringUtils.hasText(configuredApiKey)) {
            String provided = httpReq.getHeader(API_KEY_HEADER);

            if (!configuredApiKey.equals(provided)) {
                log.warn("Unauthorized access attempt to {} — invalid or missing {}",
                         PROTECTED_PATH, API_KEY_HEADER);
                httpResp.setStatus(HttpStatus.UNAUTHORIZED.value());
                httpResp.setContentType(MediaType.APPLICATION_JSON_VALUE);
                httpResp.getWriter().write(
                    "{\"error\":\"Unauthorized. A valid X-API-Key header is required.\"}"
                );
                return;
            }

            log.debug("API key validated for {}", PROTECTED_PATH);
        }

        chain.doFilter(request, response);
    }
}
