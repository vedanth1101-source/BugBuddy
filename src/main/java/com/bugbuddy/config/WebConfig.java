package com.bugbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the BugBuddy REST API.
 *
 * Allows cross-origin requests from:
 *  - http://localhost:3000  (Create React App / typical React dev server)
 *  - http://localhost:5173  (Vite dev server)
 *
 * Covers all endpoints under /api/** and permits the HTTP methods
 * used by the BugController. Credentials (cookies, auth headers) are
 * also enabled so that session-based auth can be added in a future phase.
 *
 * NOTE: In production, restrict allowedOrigins to your actual frontend domain.
 */
@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // ── Allowed frontend origins ────────────────────────
                        .allowedOrigins(
                                "http://localhost:3000",   // CRA / generic React
                                "http://localhost:5173"    // Vite
                        )
                        // ── Allowed HTTP methods ────────────────────────────
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        // ── Allowed request headers ─────────────────────────
                        .allowedHeaders("*")
                        // ── Expose standard response headers to the browser ─
                        .exposedHeaders("Content-Type", "Authorization")
                        // ── Allow cookies / auth tokens ─────────────────────
                        .allowCredentials(true)
                        // ── Pre-flight cache duration (seconds) ─────────────
                        .maxAge(3600);
            }
        };
    }
}
