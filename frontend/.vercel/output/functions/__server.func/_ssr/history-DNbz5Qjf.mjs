import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { N as Navbar, a as Spinner, E as ErrorBanner, s as searchBugs, f as fetchBugHistory } from "./ErrorBanner-DJxhXry0.mjs";
import { k as keepPreviousData } from "../_libs/tanstack__query-core.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
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
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
const MAX_PREVIEW = 60;
function truncate(text, max) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}...` : flat;
}
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(void 0, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}
function HistoryRow({ row }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const toggle = () => setExpanded((v) => !v);
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "tr",
      {
        tabIndex: 0,
        role: "button",
        "aria-expanded": expanded,
        "aria-controls": `row-detail-${row.id}`,
        onClick: toggle,
        onKeyDown: onKey,
        className: "cursor-pointer border-t border-slate-200 transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:hover:bg-slate-800/40 dark:focus:bg-slate-800/40",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-sm font-mono text-slate-500 dark:text-slate-400", children: [
            "#",
            row.id
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900", children: row.language }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: truncate(row.errorText, MAX_PREVIEW) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap", children: formatDate(row.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: [
                "ml-auto h-4 w-4 transition-transform duration-200",
                expanded ? "rotate-180" : "rotate-0"
              ].join(" "),
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
          ) })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "tr",
      {
        id: `row-detail-${row.id}`,
        className: "border-t border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-slate-900/40",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400", children: "✅ AI Explanation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200", children: row.aiExplanation })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400", children: "🔧 Suggested Fix" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-amber-50 dark:bg-black/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: row.suggestedFix }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400", children: "Raw Error" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: row.errorText }) })
          ] })
        ] }) })
      }
    )
  ] });
}
const PAGE_SIZE = 10;
function HistoryTable() {
  const [page, setPage] = reactExports.useState(0);
  const [search, setSearch] = reactExports.useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const queryKey = reactExports.useMemo(
    () => ["bugs", { page, size: PAGE_SIZE, q: debouncedSearch }],
    [page, debouncedSearch]
  );
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => debouncedSearch ? searchBugs(debouncedSearch, page, PAGE_SIZE) : fetchBugHistory(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
    staleTime: 3e4
  });
  const totalPages = data?.totalPages ?? 1;
  const currentPage = (data?.page ?? page) + 1;
  const isEmpty = !isLoading && (data?.content.length ?? 0) === 0;
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400",
          viewBox: "0 0 20 20",
          fill: "currentColor",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              fillRule: "evenodd",
              d: "M9 3.5a5.5 5.5 0 103.916 9.395l3.094 3.095a.75.75 0 101.06-1.06l-3.094-3.095A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z",
              clipRule: "evenodd"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "history-search", className: "sr-only", children: "Search past error logs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "history-search",
          type: "search",
          value: search,
          onChange: (e) => handleSearchChange(e.target.value),
          placeholder: "Search past error logs via full-text keyword...",
          className: "block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        }
      ),
      isFetching && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-3 flex items-center text-slate-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "h-4 w-4", label: "Refreshing" }) })
    ] }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ErrorBanner,
      {
        message: error?.message ?? "Unable to load history. Please retry in a moment.",
        onDismiss: () => refetch()
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-slate-200 dark:divide-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("caption", { className: "sr-only", children: "BugBuddy audit history log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 dark:bg-slate-900/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
              children: "ID"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
              children: "Language"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
              children: "Error Preview"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "th",
            {
              scope: "col",
              className: "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
              children: "Date"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { scope: "col", className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Expand" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800/60", children: [
          isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-4 py-10 text-center text-sm text-slate-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "h-4 w-4" }),
            " Loading audit log…"
          ] }) }) }),
          !isLoading && data?.content.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryRow, { row }, row.id)),
          isEmpty && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "td",
            {
              colSpan: 5,
              className: "px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400",
              children: "No log entries match your query."
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Page ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: currentPage }),
          " of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: totalPages }),
          data && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-slate-400", children: [
            "(",
            data.totalElements,
            " total entries)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPage((p) => Math.max(0, p - 1)),
              disabled: page === 0 || isLoading,
              className: "inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
              children: "← Previous"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPage((p) => totalPages > 0 ? Math.min(totalPages - 1, p + 1) : p),
              disabled: currentPage >= totalPages || isLoading,
              className: "inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
              children: "Next →"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function HistoryPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl", children: "Audit history" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "max-w-2xl text-sm text-slate-600 dark:text-slate-400", children: [
          "Every triage request is captured here for compliance review. Click or press ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("kbd", { className: "rounded border border-slate-300 bg-white px-1 text-[10px] font-mono shadow-sm dark:border-slate-700 dark:bg-slate-900", children: "Enter" }),
          " on a row to expand the full report."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryTable, {})
    ] })
  ] });
}
export {
  HistoryPage as component
};
