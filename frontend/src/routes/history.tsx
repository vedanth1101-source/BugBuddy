import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { HistoryTable } from "@/features/history/HistoryTable";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Audit History — BugBuddy" },
      {
        name: "description",
        content:
          "Searchable enterprise audit log of every error triaged by BugBuddy, with full AI explanations and suggested fixes.",
      },
      { property: "og:title", content: "Audit History — BugBuddy" },
      {
        property: "og:description",
        content: "Searchable enterprise audit log of every BugBuddy triage.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Audit history
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Every triage request is captured here for compliance review.
            Click or press <kbd className="rounded border border-slate-300 bg-white px-1 text-[10px] font-mono shadow-sm dark:border-slate-700 dark:bg-slate-900">Enter</kbd> on a row to expand the full report.
          </p>
        </header>

        <HistoryTable />
      </main>
    </div>
  );
}
