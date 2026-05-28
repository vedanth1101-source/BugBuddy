import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchBugHistory, searchBugs } from "@/lib/apiClient";
import type { PaginatedBugs } from "@/lib/types";
import { HistoryRow } from "./HistoryRow";
import { Spinner } from "@/components/Spinner";
import { ErrorBanner } from "@/components/ErrorBanner";

const PAGE_SIZE = 10;

export function HistoryTable() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);

  const queryKey = useMemo(
    () => ["bugs", { page, size: PAGE_SIZE, q: debouncedSearch }] as const,
    [page, debouncedSearch],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    PaginatedBugs,
    Error
  >({
    queryKey,
    queryFn: () =>
      debouncedSearch
        ? searchBugs(debouncedSearch, page, PAGE_SIZE)
        : fetchBugHistory(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const totalPages = data?.totalPages ?? 1;
  const currentPage = (data?.page ?? page) + 1;
  const isEmpty = !isLoading && (data?.content.length ?? 0) === 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <svg
          className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 103.916 9.395l3.094 3.095a.75.75 0 101.06-1.06l-3.094-3.095A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
            clipRule="evenodd"
          />
        </svg>
        <label htmlFor="history-search" className="sr-only">
          Search past error logs
        </label>
        <input
          id="history-search"
          type="search"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search past error logs via full-text keyword..."
          className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
        />
        {isFetching && !isLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center text-slate-400">
            <Spinner className="h-4 w-4" label="Refreshing" />
          </div>
        )}
      </div>

      {isError && (
        <ErrorBanner
          message={
            error?.message ??
            "Unable to load history. Please retry in a moment."
          }
          onDismiss={() => refetch()}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <caption className="sr-only">BugBuddy audit history log</caption>
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Language
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Error Preview
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Date
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Expand</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Spinner className="h-4 w-4" /> Loading audit log…
                    </span>
                  </td>
                </tr>
              )}
              {!isLoading &&
                data?.content.map((row) => <HistoryRow key={row.id} row={row} />)}
              {isEmpty && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No log entries match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300 sm:flex-row">
          <p>
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
            {data && (
              <span className="ml-2 text-xs text-slate-400">
                ({data.totalElements} total entries)
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((p) => (totalPages > 0 ? Math.min(totalPages - 1, p + 1) : p))
              }
              disabled={currentPage >= totalPages || isLoading}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
