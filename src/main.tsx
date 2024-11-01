import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ui/ErrorFallback";
import Layout from "./layout";
import {
  ErrorComponent,
  RouterProvider,
  createRouter,
} from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import { Spinner } from "./components/Spinner";

// Initialize QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5, // Number of retry attempts
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
      refetchOnWindowFocus: false, // Optional: Disable refetch on window focus
    },
  },
});
// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>
      <Spinner />
    </div>
  ),
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Layout>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} defaultPreload="intent" />
      </QueryClientProvider>
    </Layout>
  </StrictMode>
);
