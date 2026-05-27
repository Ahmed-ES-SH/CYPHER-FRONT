"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth.store";
import {
  handleLogin,
  handleLogout,
  initializeSession,
  sendResetPasswordApi,
  verifyResetTokenApi,
  resetPasswordApi,
  authKeys,
} from "./auth.api";

/* ======================
   useAuth
====================== */

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isLoading = useAuthStore((s) => s.isLoading);

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
  }, [isInitialized]);

  return useAuth();
}

/* ======================
   useLogin
====================== */

export function useLogin() {
  const queryClient = useQueryClient();
  const loginLoading = useAuthStore((s) => s.isLoading.login);

  const mutation = useMutation({
    mutationFn: handleLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  return {
    login: mutation.mutateAsync,
    isLoading: loginLoading,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

/* ======================
   useLogout
====================== */

export function useLogout() {
  const queryClient = useQueryClient();
  const logoutLoading = useAuthStore((s) => s.isLoading.logout);

  const mutation = useMutation({
    mutationFn: handleLogout,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: logoutLoading,
    error: mutation.error,
  };
}

/* ======================
   useResetPassword
====================== */

export function useResetPassword() {
  const resetPasswordLoading = useAuthStore((s) => s.isLoading.resetPassword);

  const sendMutation = useMutation({
    mutationFn: sendResetPasswordApi,
    onMutate: () => useAuthStore.getState().setLoading("resetPassword", true),
    onSettled: () => useAuthStore.getState().setLoading("resetPassword", false),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyResetTokenApi,
    onMutate: () => useAuthStore.getState().setLoading("resetPassword", true),
    onSettled: () => useAuthStore.getState().setLoading("resetPassword", false),
  });

  const resetMutation = useMutation({
    mutationFn: resetPasswordApi,
    onMutate: () => useAuthStore.getState().setLoading("resetPassword", true),
    onSettled: () => useAuthStore.getState().setLoading("resetPassword", false),
  });

  return {
    send: sendMutation,
    verify: verifyMutation,
    reset: resetMutation,
    isLoading: resetPasswordLoading,
  };
}
