/* eslint-disable @typescript-eslint/no-explicit-any */
import { globalRequest } from "@/app/helpers/globalRequest";
import { OrderError } from "../utils/error";

export interface Transport {
  get<T = any>(endpoint: string): Promise<T>;
  post<T = any>(endpoint: string, body?: unknown): Promise<T>;
  patch<T = any>(endpoint: string, body?: unknown): Promise<T>;
  delete<T = any>(endpoint: string): Promise<T>;
}

async function transportRequest<TResult = any>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<TResult> {
  const res = await globalRequest({ endpoint, method, body });
  if (!res.success) {
    throw new OrderError(
      res.message ?? "API Request Failed",
      res.statusCode ?? 500,
    );
  }
  return res.data as TResult;
}

export const defaultTransport: Transport = {
  get: <T>(endpoint: string) => transportRequest<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "POST", body),
  patch: <T>(endpoint: string, body?: unknown) => transportRequest<T>(endpoint, "PATCH", body),
  delete: <T>(endpoint: string) => transportRequest<T>(endpoint, "DELETE"),
};

let activeTransport: Transport = defaultTransport;

export function setOrderTransport(transport: Transport) {
  activeTransport = transport;
}

export function getOrderTransport(): Transport {
  return activeTransport;
}
