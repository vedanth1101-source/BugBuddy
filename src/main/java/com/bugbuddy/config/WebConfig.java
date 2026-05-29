package com.bugbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class WebConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // ── The VIP List ──────────────────────────────────────────
        config.setAllowedOrigins(Arrays.asList(
                "https://bugbuddy-web.vercel.app", 
                "http://localhost:3000",
                "http://localhost:5173"
        ));
        
        // ── The Aggressive Headers ────────────────────────────────
        config.setAllowedHeaders(Arrays.asList(
                "Origin", "Content-Type", "Accept", "Authorization",
                "X-Requested-With", "Access-Control-Request-Method", 
                "Access-Control-Request-Headers"
        ));
        
        // ── The Allowed Methods ───────────────────────────────────
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // ── Force Credentials and Max Age ─────────────────────────
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        // Apply this filter to EVERY endpoint
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}