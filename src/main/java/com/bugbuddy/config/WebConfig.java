package com.bugbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration for the BugBuddy REST API.
 */
@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        // ── Allowed frontend origins (UPDATED FOR VERCEL) ──
                        .allowedOrigins(
                                "https://bugbuddy-web.vercel.app", // Your live Vercel app
                                "http://localhost:3000",           // CRA dev server
                                "http://localhost:5173"            // Vite dev server
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