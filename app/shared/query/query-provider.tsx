import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isAppError } from "~/shared/errors";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Client errors (4xx) won't succeed on retry; network and 5xx might
        retry: (failureCount, error) =>
          !(isAppError(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
    },
  });
}

/** App-wide React Query client, mounted once in root.tsx */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
