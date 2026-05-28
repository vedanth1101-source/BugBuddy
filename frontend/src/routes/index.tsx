import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { ErrorBanner } from "@/components/ErrorBanner";
import { AnalyzeForm } from "@/features/analyze/AnalyzeForm";
import { ResultsCard } from "@/features/analyze/ResultsCard";
import { analyzeBug, ServiceUnavailableError } from "@/lib/apiClient";
import type { AnalyzeRequest, BugAnalysis } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BugBuddy — AI Error Triage" },
      {
        name: "description",
        content:
          "Paste a stack trace, get an AI-powered explanation and suggested fix. Enterprise-grade triage for Java, Python and JavaScript.",
      },
      { property: "og:title", content: "BugBuddy — AI Error Triage" },
      {
        property: "og:description",
        content: "Enterprise-grade AI triage for Java, Python and JavaScript stack traces.",
      },
    ],
  }),
  component: AnalysePage,
});

function AnalysePage() {
  const mutation = useMutation<BugAnalysis, Error, AnalyzeRequest>({
    mutationFn: analyzeBug,
  });

  const showServiceBanner =
    mutation.isError &&
    (mutation.error instanceof ServiceUnavailableError ||
      /503|unavailable|network/i.test(mutation.error?.message ?? ""));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Analyse an error
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Paste any stack trace or runtime exception. BugBuddy will return a
            plain-English explanation and a production-ready suggested fix.
          </p>
        </header>

        {showServiceBanner && (
          <ErrorBanner
            message="AI Triage Service temporarily unavailable. Please try again later."
            onDismiss={() => mutation.reset()}
          />
        )}

        <AnalyzeForm
          isPending={mutation.isPending}
          onSubmit={(req) => mutation.mutate(req)}
        />

        {mutation.isSuccess && mutation.data && <ResultsCard result={mutation.data} />}
      </main>
    </div>
  );
}
