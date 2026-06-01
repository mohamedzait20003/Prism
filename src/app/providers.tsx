"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider, type Persister } from "@tanstack/react-query-persist-client";

const CACHE_KEY = "prism:query-cache";

const localStoragePersister: Persister = {
  persistClient: async (client) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    localStorage.removeItem(CACHE_KEY);
  },
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
  });
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Parameters<typeof SessionProvider>[0]["session"];
}) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <SessionProvider session={session}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: localStoragePersister,
          maxAge: 1000 * 60 * 60 * 24,
          buster: "v1",
        }}
      >
        {children}
      </PersistQueryClientProvider>
    </SessionProvider>
  );
}
