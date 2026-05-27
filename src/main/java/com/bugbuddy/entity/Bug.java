package com.bugbuddy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a bug/error entry in the BugBuddy system.
 *
 * FULLTEXT INDEX NOTE:
 * MySQL's FULLTEXT index on (error_text, ai_explanation) is NOT managed by Hibernate DDL.
 * You must create it manually once after the table is generated:
 *
 *   ALTER TABLE bugs ADD FULLTEXT INDEX ft_bug_search (error_text, ai_explanation);
 *
 * This is required for the native FULLTEXT search query in BugRepository to work.
 */
@Entity
@Table(
    name = "bugs",
    indexes = {
        @Index(name = "idx_bugs_language", columnList = "language"),
        @Index(name = "idx_bugs_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Bug {

    /**
     * Primary key — auto-incremented BIGINT.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The raw error text submitted by the user. Stored as TEXT (unbounded).
     * Mapped to the FULLTEXT-indexed column.
     */
    @Column(name = "error_text", columnDefinition = "TEXT", nullable = false)
    @NotBlank(message = "errorText must not be blank")
    private String errorText;

    /**
     * Programming language the error originated from.
     * Defaults to 'Java' if not provided.
     */
    @Column(name = "language", length = 50)
    @Builder.Default
    private String language = "Java";

    /**
     * AI-generated explanation of the error. Nullable until AI processes the bug.
     */
    @Column(name = "ai_explanation", columnDefinition = "TEXT")
    private String aiExplanation;

    /**
     * AI-suggested fix for the error. Nullable until AI processes the bug.
     */
    @Column(name = "suggested_fix", columnDefinition = "TEXT")
    private String suggestedFix;

    /**
     * Flag indicating whether this result was served from a cached (existing) DB record.
     * Defaults to false for new entries.
     */
    @Column(name = "is_cached")
    @Builder.Default
    private Boolean isCached = false;

    /**
     * Timestamp of when this record was created. Set automatically by Hibernate.
     */
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
