package com.bugbuddy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verifies that the Spring application context loads successfully.
 * Requires a running MySQL instance with bugbuddy_db to pass.
 */
@SpringBootTest
@ActiveProfiles("test")
class BugBuddyApplicationTests {

    @Test
    void contextLoads() {
        // If the Spring context fails to load, this test will fail with a
        // descriptive error pointing to the misconfigured bean or property.
    }
}
