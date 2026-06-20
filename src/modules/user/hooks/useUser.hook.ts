"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  registerApi,
  listUsersApi,
  getUserStatsApi,
  getUserByIdApi,
  updateUserApi,
  deleteUserApi,
} from "../api/user.api";
import { userKeys } from "../constants/user.constants";
import type {
  User,
  PaginatedUsers,
  UserStats,
  CreateUserDto,
  UpdateUserDto,
} from "../types/user.types";
import { verifyEmailApi } from "../../auth/auth.api";

export function useRegister() {
  return useMutation({
    mutationFn: (dto: CreateUserDto) => registerApi(dto),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: ({token, email}: {token: string, email: string}) => verifyEmailApi({token , email}),
  });
}

export function useUsers(filters?: Record<string, string>) {
  return useQuery<PaginatedUsers>({
    queryKey: userKeys.list(filters),
    queryFn: () => listUsersApi(filters),
    staleTime: 30000,
  });
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: userKeys.stats(),
    queryFn: getUserStatsApi,
    staleTime: 60000,
  });
}

export function useUser(id: number | undefined) {
  return useQuery<User>({
    queryKey: userKeys.detail(id!),
    queryFn: () => getUserByIdApi(id!),
    staleTime: 30000,
    enabled: id !== undefined,
  });
}

export function useUpdateUser(id: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateUserDto) => {
      if (id === undefined) throw new Error("User ID is required");
      return updateUserApi(id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
      if (id !== undefined) {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUserApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });
    },
  });
}
