package com.bugbuddy.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Central Spring bean configuration for BugBuddy infrastructure components.
 *
 * Defines a shared {@link RestTemplate} bean used by {@link com.bugbuddy.service.BugService}
 * to communicate with the Gemini AI REST API.
 *
 * Timeout policy:
 *  - Connection timeout : 5 seconds  — fail fast if the remote host is unreachable
 *  - Read timeout       : 10 seconds — strict SLA ceiling for Gemini AI responses.
 *    Exceeding this threshold throws ResourceAccessException, which BugService
 *    catches and maps to ServiceUnavailableException → HTTP 503.
 */
@Configuration
public class AppConfig {

    /**
     * Configured RestTemplate for external HTTP calls.
     *
     * Uses {@link RestTemplateBuilder} so that connection and read timeouts
     * are set at the underlying ClientHttpRequestFactory level — no manual
     * HttpComponentsClientHttpRequestFactory wiring needed.
     *
     * The {@link MappingJackson2HttpMessageConverter} is already registered
     * by Spring Boot's auto-configuration; no additional converter setup required.
     *
     * @param builder auto-wired RestTemplateBuilder provided by Spring Boot
     * @return a fully configured, timeout-aware RestTemplate
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))   // strict 10-second SLA
                .build();
    }
}
