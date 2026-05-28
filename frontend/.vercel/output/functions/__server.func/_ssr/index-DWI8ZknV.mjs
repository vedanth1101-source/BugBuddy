import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as ServiceUnavailableError, N as Navbar, E as ErrorBanner, b as analyzeBug, L as LANGUAGES, a as Spinner } from "./ErrorBanner-DJxhXry0.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
function AnalyzeForm({ isPending, onSubmit }) {
  const [language, setLanguage] = reactExports.useState("Java");
  const [errorText, setErrorText] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = errorText.trim();
    if (!trimmed || isPending) return;
    onSubmit({ errorText: trimmed, language });
  };
  const disabled = isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: handleSubmit,
      className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8",
      noValidate: true,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "language",
                className: "block text-sm font-medium text-slate-700 dark:text-slate-200",
                children: "Language"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  id: "language",
                  name: "language",
                  value: language,
                  onChange: (e) => setLanguage(e.target.value),
                  disabled,
                  className: "block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white",
                  children: LANGUAGES.map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: lang, children: lang }, lang))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "svg",
                {
                  className: "pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  "aria-hidden": "true",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      d: "M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z",
                      clipRule: "evenodd"
                    }
                  )
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "errorText",
                className: "block text-sm font-medium text-slate-700 dark:text-slate-200",
                children: "Error / stack trace"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "errorText",
                name: "errorText",
                rows: 8,
                value: errorText,
                onChange: (e) => setErrorText(e.target.value),
                disabled,
                placeholder: "Paste your raw error string or runtime stack trace here...",
                className: "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500",
                spellCheck: false
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex items-center justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: disabled || errorText.trim().length === 0,
            className: "inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-blue-600/60 dark:focus:ring-offset-slate-900",
            children: isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "h-4 w-4", label: "Analysing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Analysing…" })
            ] }) : "Analyse Error"
          }
        ) })
      ]
    }
  );
}
function ResultsCard({ result }) {
  const [copied, setCopied] = reactExports.useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.suggestedFix);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-label": "Analysis results", className: "space-y-4", children: [
    result.isCached && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        role: "status",
        className: "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-gradient-to-r from-slate-100 to-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "📦" }),
          "Retrieved from Local Cache (0ms Network Overhead)"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-base font-semibold text-emerald-900 dark:text-emerald-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "✅" }),
          " AI Explanation"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 whitespace-pre-wrap text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-100/90", children: result.aiExplanation })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-base font-semibold text-amber-900 dark:text-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: "🔧" }),
            " Suggested Fix"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleCopy,
              className: "inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white/70 px-2.5 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-white dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50",
              "aria-label": "Copy suggested fix to clipboard",
              children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    fillRule: "evenodd",
                    d: "M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z",
                    clipRule: "evenodd"
                  }
                ) }),
                "Copied"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v9a2 2 0 002 2h8a2 2 0 002-2v-1h1a2 2 0 002-2V4a2 2 0 00-2-2H8zm0 2h8v9h-1V7a2 2 0 00-2-2H8V4zM5 7h8v9H5V7z" }) }),
                "Copy"
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-amber-50 shadow-inner dark:bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: result.suggestedFix }) })
      ] })
    ] })
  ] });
}
function AnalysePage() {
  const mutation = useMutation({
    mutationFn: analyzeBug
  });
  const showServiceBanner = mutation.isError && (mutation.error instanceof ServiceUnavailableError || /503|unavailable|network/i.test(mutation.error?.message ?? ""));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl", children: "Analyse an error" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-2xl text-sm text-slate-600 dark:text-slate-400", children: "Paste any stack trace or runtime exception. BugBuddy will return a plain-English explanation and a production-ready suggested fix." })
      ] }),
      showServiceBanner && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: "AI Triage Service temporarily unavailable. Please try again later.", onDismiss: () => mutation.reset() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyzeForm, { isPending: mutation.isPending, onSubmit: (req) => mutation.mutate(req) }),
      mutation.isSuccess && mutation.data && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsCard, { result: mutation.data })
    ] })
  ] });
}
export {
  AnalysePage as component
};
