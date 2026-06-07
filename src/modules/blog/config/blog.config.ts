/* =========================================================
   Blog Module Configuration
   ========================================================= */

export interface BlogConfig {
  baseURL: string;
  staleTime: number;
  adminStaleTime: number;
  gcTime: number;
  retry: number;
  defaultLimit: number;
  maxLimit: number;
}

const defaultConfig: BlogConfig = {
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000",
  staleTime: 5 * 60 * 1000, // 5 min
  adminStaleTime: 30 * 1000, // 30 sec
  gcTime: 30 * 60 * 1000, // 30 min
  retry: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

let currentConfig: BlogConfig = { ...defaultConfig };

export function configureBlog(overrides: Partial<BlogConfig>): void {
  currentConfig = { ...currentConfig, ...overrides };
}

export function getBlogConfig(): BlogConfig {
  return { ...currentConfig };
}

export function resetBlogConfig(): void {
  currentConfig = { ...defaultConfig };
}
