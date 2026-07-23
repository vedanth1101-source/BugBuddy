package com.bugbuddy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verifies that the full Spring application context loads
 * successfully with the H2 in-memory database (test profile).
 *
 * This test intentionally loads the real context (not a slice) so it catches
 * misconfigured beans, missing @Value properties, and circular dependencies
 * that narrower slice tests would not detect.
 */
@SpringBootTest
@ActiveProfiles("test")
class BugBuddyApplicationTests {

    @Test
    @DisplayName("Spring application context loads without errors")
    void contextLoads() {
        // If the Spring context fails to load, this test will fail with a
        // descriptive error pointing to the misconfigured bean or property.
        // No assertions needed — the test passing IS the assertion.
    }
}
