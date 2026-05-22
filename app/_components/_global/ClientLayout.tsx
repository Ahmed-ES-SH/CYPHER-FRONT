"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DataProvider from "@/app/context/DataContext";
import VariablesProvider from "@/app/context/VariablesContext";
import React, { ReactNode } from "react";
import { useSession } from "@/src/modules/auth";
import { setOnUnauthorized, useAuthStore } from "@/src/modules/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

setOnUnauthorized(() => useAuthStore.getState().reset());

function SessionProvider({ children }: { children: ReactNode }) {
  useSession();
  return <>{children}</>;
}

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <VariablesProvider>
          <DataProvider>{children}</DataProvider>
        </VariablesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
