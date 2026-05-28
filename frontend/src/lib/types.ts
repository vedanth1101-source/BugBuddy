/**
 * Strict typings mirroring the Java Spring Boot backend payloads for BugBuddy.
 */

export type SupportedLanguage = "Java" | "Python" | "JavaScript";

/**
 * Canonical bug analysis record. Mirrors the API blueprint exactly:
 * {
 *   "id": number,
 *   "errorText": string,
 *   "language": string,
 *   "aiExplanation": string,
 *   "suggestedFix": string,
 *   "isCached": boolean,
 *   "createdAt": string
 * }
 */
export interface BugAnalysis {
  id: number;
  errorText: string;
  language: string;
  aiExplanation: string;
  suggestedFix: string;
  isCached: boolean;
  createdAt: string;
}

export interface AnalyzeRequest {
  errorText: string;
  language: SupportedLanguage;
}

export interface PaginatedBugs {
  content: BugAnalysis[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
