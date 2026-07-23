import type { AnalyzeRequest, BugAnalysis, PaginatedBugs } from "./types";

/**
 * Centralized API client for the BugBuddy Spring Boot backend.
 *
 * This client never fabricates data. If the backend is unreachable, every
 * call surfaces ServiceUnavailableError so the UI can say so plainly.
 *
 * (It previously fell back to a generated mock dataset when the network was
 * unreachable — a workaround for a sandboxed preview environment. Once
 * deployed publicly that behaviour made a dead backend look like a live one,
 * rendering invented "audit history" rows as though they were real triages.)
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://bugbuddy-production-b2f5.up.railway.app";

export class ServiceUnavailableError extends Error {
  constructor(message = "AI Triage Service temporarily unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Detects errors that indicate the local backend is unreachable
 * (sandbox network boundary, ECONNREFUSED, CORS preflight failure).
 */
function isNetworkUnreachable(err: unknown): boolean {
  if (err instanceof TypeError) return true; // browser fetch network failure
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    return (
      m.includes("failed to fetch") ||
      m.includes("networkerror") ||
      m.includes("load failed") ||
      m.includes("econnrefused")
    );
  }
  return false;
}

async function withTimeout<T>(p: Promise<T>, ms = 3500): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await p;
  } finally {
    clearTimeout(timer);
  }
}

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

void withTimeout; // exported helper retained for future callers

export async function analyzeBug(req: AnalyzeRequest): Promise<BugAnalysis> {
  try {
    const res = await safeFetch(`${API_BASE_URL}/api/bugs/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(req),
    });

    if (res.status === 503) {
      throw new ServiceUnavailableError();
    }
    if (!res.ok) {
      throw new Error(`Analyze failed: HTTP ${res.status}`);
    }
    return (await res.json()) as BugAnalysis;
  } catch (err) {
    if (err instanceof ServiceUnavailableError) throw err;
    // A dead backend surfaces as a fetch TypeError ("Failed to fetch"), which
    // the UI's error matcher does not recognise. Normalise it so the user is
    // told the service is down instead of the request appearing to do nothing.
    if (isNetworkUnreachable(err)) throw new ServiceUnavailableError();
    throw err;
  }
}

export async function fetchBugHistory(
  page: number,
  size = 10,
): Promise<PaginatedBugs> {
  try {
    const res = await safeFetch(`${API_BASE_URL}/api/bugs?page=${page}&size=${size}`);
    if (!res.ok) throw new Error(`History failed: HTTP ${res.status}`);
    return (await res.json()) as PaginatedBugs;
  } catch (err) {
    if (isNetworkUnreachable(err)) throw new ServiceUnavailableError();
    throw err;
  }
}

export async function searchBugs(query: string, page = 0, size = 10): Promise<PaginatedBugs> {
  try {
    const url = `${API_BASE_URL}/api/bugs/search?q=${encodeURIComponent(query)}`;
    const res = await safeFetch(url);
    if (!res.ok) throw new Error(`Search failed: HTTP ${res.status}`);
    const data = (await res.json()) as PaginatedBugs | BugAnalysis[];
    // Tolerate both array and paginated shapes from the backend.
    if (Array.isArray(data)) {
      const totalPages = Math.max(1, Math.ceil(data.length / size));
      const safePage = Math.min(Math.max(0, page), totalPages - 1);
      return {
        content: data.slice(safePage * size, safePage * size + size),
        page: safePage,
        size,
        totalElements: data.length,
        totalPages,
      };
    }
    return data;
  } catch (err) {
    if (isNetworkUnreachable(err)) throw new ServiceUnavailableError();
    throw err;
  }
}
