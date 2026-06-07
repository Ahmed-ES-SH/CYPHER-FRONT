import type { AxiosInstance } from "axios";

let client: AxiosInstance | null = null;

export function getPaymentsClient(): AxiosInstance {
  if (client) return client;
  throw new Error(
    "getPaymentsClient is deprecated. Use the API functions in payments.api.ts instead.",
  );
}

export function resetPaymentsClient(): void {
  client = null;
}

export type { AxiosInstance };
