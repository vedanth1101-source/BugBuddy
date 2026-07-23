import { useState, type FormEvent } from "react";
import { Spinner } from "@/components/Spinner";
import { LANGUAGES } from "@/lib/constants";
import type { AnalyzeRequest, SupportedLanguage } from "@/lib/types";

/** Maximum characters accepted before client-side abort. Protects backend quota. */
const MAX_ERROR_TEXT_LENGTH = 5_000;

interface AnalyzeFormProps {
  isPending: boolean;
  /** Must return a Promise so the try/finally block can await network completion. */
  onSubmit: (req: AnalyzeRequest) => Promise<void> | void;
}

export function AnalyzeForm({ isPending, onSubmit }: AnalyzeFormProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("Java");
  const [errorText, setErrorText] = useState("");

  // ── Local analyzing flag — fires instantly on click, before the network
  //    round-trip begins. Guarantees the button is disabled and shows the
  //    spinner even during the synchronous gap before useMutation's isPending
  //    becomes true. Reset unconditionally in the finally block.
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ── Guard 1: Duplicate-call prevention — instant early return if already in flight.
    if (isAnalyzing) return;

    const trimmed = errorText.trim();
    if (!trimmed) return;

    // ── Guard 2: Client-side payload defence — abort before the network call
    //    if the input exceeds the allowed length. Protects backend AI quota.
    if (trimmed.length > MAX_ERROR_TEXT_LENGTH) {
      alert(
        `Your error text is ${trimmed.length.toLocaleString()} characters. ` +
          `Please trim it to ${MAX_ERROR_TEXT_LENGTH.toLocaleString()} characters or fewer before submitting.`
      );
      return;
    }

    // ── Disable button immediately, before any async work starts.
    setIsAnalyzing(true);

    try {
      await onSubmit({ errorText: trimmed, language });
    } finally {
      // ── Unconditional reset: re-enables the button even if the network
      //    call throws, times out, or the component is in an error state.
      setIsAnalyzing(false);
    }
  };

  // Combine local flag with parent mutation state for full coverage.
  const disabled = isAnalyzing || isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Language
          </label>
          <div className="relative mt-2">
            <select
              id="language"
              name="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              disabled={disabled}
              className="block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400"
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
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="errorText"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Error / stack trace
            </label>
            {/* Live character counter — turns red when approaching the limit */}
            <span
              className={`text-xs tabular-nums ${
                errorText.length > MAX_ERROR_TEXT_LENGTH
                  ? "font-semibold text-red-500"
                  : "text-slate-400"
              }`}
              aria-live="polite"
            >
              {errorText.length.toLocaleString()} / {MAX_ERROR_TEXT_LENGTH.toLocaleString()}
            </span>
          </div>
          <textarea
            id="errorText"
            name="errorText"
            rows={8}
            value={errorText}
            onChange={(e) => setErrorText(e.target.value)}
            disabled={disabled}
            placeholder="Paste your raw error string or runtime stack trace here..."
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end">
        <button
          type="submit"
          disabled={disabled || errorText.trim().length === 0}
          className="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-blue-600/60 dark:focus:ring-offset-slate-900"
        >
          {isAnalyzing || isPending ? (
            <>
              <Spinner className="h-4 w-4" label="Analysing" />
              <span>Analysing…</span>
            </>
          ) : (
            "Analyse Error"
          )}
        </button>
      </div>
    </form>
  );
}
