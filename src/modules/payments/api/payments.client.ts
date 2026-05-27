import axios from "axios";
import type { AxiosInstance } from "axios";
import { getPaymentsConfig } from "../config/payments.config";
import { PAYMENT_REQUEST_TIMEOUT } from "../constants/payments.constants";
import { normalizePaymentError } from "../utils/normalizePaymentError";

let client: AxiosInstance | null = null;

export function getPaymentsClient(): AxiosInstance {
  if (client) return client;

  const config = getPaymentsConfig();

  client = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    timeout: PAYMENT_REQUEST_TIMEOUT,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const normalized = normalizePaymentError(error);
      return Promise.reject(normalized);
    },
  );

  return client;
}

export function resetPaymentsClient(): void {
  client = null;
}

export type { AxiosInstance };
