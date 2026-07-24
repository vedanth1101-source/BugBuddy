import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // One retry, not the default three. When the backend is unreachable,
        // the "service unavailable" state should appear in a couple of seconds
        // rather than after ~25s of exponential-backoff retries.
        retry: 1,
        retryDelay: 800,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
