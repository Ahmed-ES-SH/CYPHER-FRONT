export interface PaymentsConfig {
  apiUrl: string;
  staleTime: number;
  gcTime: number;
  retryCount: number;
}

const DEFAULTS = {
  STALE_TIME: 30 * 1000,
  GC_TIME: 5 * 60 * 1000,
  RETRY_COUNT: 1,
} as const;

let cachedConfig: PaymentsConfig | null = null;

export function getPaymentsConfig(): PaymentsConfig {
  if (cachedConfig) return cachedConfig;

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!apiUrl) {
    throw new Error(
      "Payments module: NEXT_PUBLIC_BACKEND_URL is not configured. " +
      "Set this environment variable to your API base URL before using the payments module.",
    );
  }

  cachedConfig = {
    apiUrl,
    staleTime: DEFAULTS.STALE_TIME,
    gcTime: DEFAULTS.GC_TIME,
    retryCount: DEFAULTS.RETRY_COUNT,
  };

  return cachedConfig;
}

export function resetPaymentsConfig(): void {
  cachedConfig = null;
}
