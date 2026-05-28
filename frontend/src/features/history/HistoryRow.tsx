import { useState, type KeyboardEvent } from "react";
import type { BugAnalysis } from "@/lib/types";

interface HistoryRowProps {
  row: BugAnalysis;
}

const MAX_PREVIEW = 60;

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}...` : flat;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function HistoryRow({ row }: HistoryRowProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded((v) => !v);

  const onKey = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <>
      <tr
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-controls={`row-detail-${row.id}`}
        onClick={toggle}
        onKeyDown={onKey}
        className="cursor-pointer border-t border-slate-200 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:hover:bg-slate-800/40 dark:focus:bg-slate-800/40"
      >
        <td className="px-4 py-3 text-sm font-mono text-slate-500 dark:text-slate-400">
          #{row.id}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
            {row.language}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-200">
          <span className="line-clamp-1">{truncate(row.errorText, MAX_PREVIEW)}</span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </td>
        <td className="px-4 py-3 text-right text-slate-400">
          <svg
            className={[
              "ml-auto h-4 w-4 transition-transform duration-200",
              expanded ? "rotate-180" : "rotate-0",
            ].join(" ")}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr
          id={`row-detail-${row.id}`}
          className="border-t border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <td colSpan={5} className="px-4 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  ✅ AI Explanation
                </h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {row.aiExplanation}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  🔧 Suggested Fix
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-amber-50 dark:bg-black/60">
                  <code className="font-mono">{row.suggestedFix}</code>
                </pre>
              </div>
              <div className="lg:col-span-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Raw Error
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <code className="font-mono">{row.errorText}</code>
                </pre>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
