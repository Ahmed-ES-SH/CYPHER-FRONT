"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "./auth.store";
import {
  sendResetPasswordApi,
  verifyResetTokenApi,
  resetPasswordApi,
} from "./auth.api";
import {
  handleLogin,
  handleLogout,
  initializeSession,
} from "./auth.service";
import { authKeys } from "./constants";

/* ======================
   useAuth
   ====================== */

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore(useShallow((s) => s.isLoading));

  return {
    user,
    isAuthenticated,
    isInitialized,
    isLoading,
    isReady: isInitialized && !isLoading.session,
  };
}

/* ======================
   useSession
   ====================== */

export function useSession() {
  const { isInitialized } = useAuth();

  useEffect(() => {
    initializeSession();
  }, []);

  return useAuth();
}

/* ======================
   useLogin
   ====================== */

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: handleLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/* ======================
   useLogout
   ====================== */

export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: handleLogout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/* ======================
   useResetPassword
   ====================== */

export function useResetPassword() {
  const sendMutation = useMutation({
    mutationFn: sendResetPasswordApi,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyResetTokenApi,
  });

  const resetMutation = useMutation({
    mutationFn: resetPasswordApi,
  });

  return {
    send: sendMutation,
    verify: verifyMutation,
    reset: resetMutation,
    isSending: sendMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isResetting: resetMutation.isPending,
    isLoading: sendMutation.isPending || verifyMutation.isPending || resetMutation.isPending,
  };
}
