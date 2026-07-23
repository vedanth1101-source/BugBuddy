package com.bugbuddy.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Automatically ensures the FULLTEXT index on the {@code bugs} table exists.
 *
 * ── Why this exists ──────────────────────────────────────────────────────────
 * Hibernate's {@code ddl-auto=update} creates ordinary indexes declared via
 * {@code @Index} but does NOT create MySQL FULLTEXT indexes. Without the index,
 * {@code GET /api/bugs/search} fails at runtime with a MySQL syntax error.
 *
 * Previously, the index required a manual one-time ALTER TABLE. This runner
 * eliminates that manual step by running it automatically at startup.
 *
 * ── Idempotency ──────────────────────────────────────────────────────────────
 * If the index already exists, MySQL throws "Duplicate key name 'ft_bug_search'".
 * This is caught and silently ignored — subsequent startups are safe.
 *
 * ── H2 compatibility ─────────────────────────────────────────────────────────
 * H2 (used in dev and tests) does not support FULLTEXT indexes. Any failure
 * on H2 is caught and logged at DEBUG level so the test suite runs unaffected.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements ApplicationRunner {

    private static final String CREATE_FULLTEXT_SQL =
            "ALTER TABLE bugs ADD FULLTEXT INDEX ft_bug_search (error_text, ai_explanation)";

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("DatabaseInitializer: ensuring FULLTEXT index exists on bugs table…");
        try {
            jdbcTemplate.execute(CREATE_FULLTEXT_SQL);
            log.info("DatabaseInitializer: FULLTEXT index ft_bug_search created successfully.");
        } catch (Exception ex) {
            String msg = ex.getMessage() != null ? ex.getMessage() : "";

            if (msg.contains("Duplicate key name") || msg.contains("already exists")) {
                // Index already present from a previous startup — nothing to do.
                log.debug("DatabaseInitializer: ft_bug_search already exists, skipping creation.");

            } else if (msg.contains("FULLTEXT") || msg.contains("H2") ||
                       msg.contains("not supported") || msg.contains("Syntax error")) {
                // H2 or other non-MySQL datasource — FULLTEXT is unavailable.
                // Search will not work, but the rest of the app runs fine.
                log.debug("DatabaseInitializer: FULLTEXT index skipped (unsupported datasource / H2).");

            } else {
                // Unexpected error — log a warning but do not crash the application.
                // The search endpoint will fail gracefully when called; all other
                // endpoints remain fully operational.
                log.warn("DatabaseInitializer: could not create FULLTEXT index — {}", msg);
            }
        }
    }
}
