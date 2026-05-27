"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DataProvider from "@/app/context/DataContext";
import VariablesProvider from "@/app/context/VariablesContext";
import React, { ReactNode, useEffect } from "react";
import { useSession } from "@/src/modules/auth";
import { setOnUnauthorized, useAuthStore } from "@/src/modules/auth";
import { configureProducts } from "@/src/modules/products";
import { setAuthAdapter } from "@/src/modules/cart";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

setOnUnauthorized(() => useAuthStore.getState().reset());

// Configure the products module's base URL
configureProducts({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000",
});

function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isReady } = useSession();

  // Wire cart auth adapter so the cart module knows auth state
  useEffect(() => {
    if (isReady) {
      setAuthAdapter({
        userId: user?.id ?? null,
        isAuthenticated,
      });
    }
  }, [user, isAuthenticated, isReady]);

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
