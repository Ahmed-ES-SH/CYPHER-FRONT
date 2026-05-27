export interface OrderApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export type ValidationErrorMap = Record<string, string>;

export interface NormalizedOrderError {
  message: string;
  statusCode: number;
  errors: ValidationErrorMap | null;
  path: string | null;
  timestamp: string | null;
  retryable: boolean;
  source: "network" | "validation" | "auth" | "server" | "unknown";
}
