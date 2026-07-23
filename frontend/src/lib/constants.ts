/** Languages BugBuddy can triage. Kept in sync with the backend's accepted values. */
export const LANGUAGES = ["Java", "Python", "JavaScript"] as const;

export type Language = (typeof LANGUAGES)[number];
