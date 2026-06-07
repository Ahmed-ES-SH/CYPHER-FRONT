import { globalRequest } from "@/app/helpers/globalRequest";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserStats,
  PaginatedUsers,
} from "../types/user.types";

export const USER_ENDPOINTS = {
  REGISTER: "/api/user",
  LIST: "/api/user",
  STATS: "/api/user/stats",
  BY_ID: (id: number) => `/api/user/${id}`,
} as const;

async function userRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw { message: res.message, status: res.statusCode, errors: res.errors };
  }
  return res.data as TResult;
}

export async function registerApi(dto: CreateUserDto): Promise<User> {
  return userRequest<User>(USER_ENDPOINTS.REGISTER, "POST", dto);
}

export async function listUsersApi(
  params?: Record<string, string>,
): Promise<PaginatedUsers> {
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  return userRequest<PaginatedUsers>(
    `${USER_ENDPOINTS.LIST}${query}`,
    "GET",
  );
}

export async function getUserStatsApi(): Promise<UserStats> {
  return userRequest<UserStats>(USER_ENDPOINTS.STATS);
}

export async function getUserByIdApi(id: number): Promise<User> {
  return userRequest<User>(USER_ENDPOINTS.BY_ID(id));
}

export async function updateUserApi(
  id: number,
  dto: UpdateUserDto,
): Promise<User> {
  return userRequest<User>(USER_ENDPOINTS.BY_ID(id), "PATCH", dto);
}

export async function deleteUserApi(id: number): Promise<void> {
  await userRequest(USER_ENDPOINTS.BY_ID(id), "DELETE");
}
