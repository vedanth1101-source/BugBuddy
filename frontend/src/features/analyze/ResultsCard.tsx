import { useState } from "react";
import type { BugAnalysis } from "@/lib/types";

interface ResultsCardProps {
  result: BugAnalysis;
}

export function ResultsCard({ result }: ResultsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.suggestedFix);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop — clipboard unavailable */
    }
  };

  return (
    <section aria-label="Analysis results" className="space-y-4">
      {result.isCached && (
        <div
          role="status"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200"
        >
          <span aria-hidden="true">📦</span>
          Retrieved from Local Cache (0ms Network Overhead)
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
          <h3 className="flex items-center gap-2 text-base font-semibold text-emerald-900 dark:text-emerald-200">
            <span aria-hidden="true">✅</span> AI Explanation
          </h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-100/90">
            {result.aiExplanation}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/20">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold text-amber-900 dark:text-amber-200">
              <span aria-hidden="true">🔧</span> Suggested Fix
            </h3>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white/70 px-2.5 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-white dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
              aria-label="Copy suggested fix to clipboard"
            >
              {copied ? (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-1h1a2 2 0 002-2V4a2 2 0 00-2-2H8zm0 2h8v9h-1V7a2 2 0 00-2-2H8V4zM5 7h8v9H5V7z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-amber-50 shadow-inner dark:bg-black/60">
            <code className="font-mono">{result.suggestedFix}</code>
          </pre>
        </article>
      </div>
    </section>
  );
}
