"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DataProvider from "@/app/context/DataContext";
import VariablesProvider from "@/app/context/VariablesContext";
import React, { ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "@/src/modules/auth";
import { setOnUnauthorized, useAuthStore } from "@/src/modules/auth";
import { configureProducts } from "@/src/modules/products";
import { setAuthAdapter, initCartCrossTabSync, useCartStore } from "@/src/modules/cart";
import { useSyncGuestCart } from "@/src/modules/cart";

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

  // Sync guest cart → server after login
  const syncMutation = useSyncGuestCart();
  const prevAuthRef = React.useRef(isAuthenticated);

  useEffect(() => {
    if (isReady && isAuthenticated && !prevAuthRef.current) {
      const guestItems = useCartStore.getState().guestItems;
      if (guestItems.length > 0) {
        syncMutation.mutate(undefined, {
          onSuccess: (result) => {
            if (result.success) {
              toast.success("Cart synced to your account!");
            } else if (result.errors && result.errors.length > 0) {
              toast.warning(
                `Some items couldn't be synced (${result.errors.length} items)`
              );
            }
          },
          onError: () => {
            toast.error("Failed to sync cart. Try refreshing.");
          },
        });
      }
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, isReady]);

  return <>{children}</>;
}

type ClientLayoutProps = {
  children: ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const queryClientRef = React.useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          retry: 1,
        },
      },
    });
  }

  useEffect(() => {
    setOnUnauthorized(() => useAuthStore.getState().clearUser());
    return () => setOnUnauthorized(null);
  }, []);

  // Cross-tab cart sync
  useEffect(() => {
    return initCartCrossTabSync();
  }, []);

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <SessionProvider>
        <VariablesProvider>
          <DataProvider>{children}</DataProvider>
        </VariablesProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

