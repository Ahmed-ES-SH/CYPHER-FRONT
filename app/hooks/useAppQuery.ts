// hooks/useAppQuery.ts
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

type UseAppQueryOptions<TData, TError> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
> & {
  enabled?: boolean;
};

async function fetcher<TData>({
  endpoint,
  config,
}: {
  endpoint: string;
  config?: RequestInit;
}): Promise<TData> {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fullURL = `${baseURL}${endpoint}`;

  const response = await fetch(fullURL, {
    ...config,
    credentials: "include", // This sends cookies with the request
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Request failed with status ${response.status}`,
    );
  }

  return response.json();
}

export function useAppQuery<TData = unknown, TError = unknown>({
  queryKey,
  endpoint,
  config,
  enabled = true,
  options,
}: {
  queryKey: QueryKey;
  endpoint: string;
  config?: RequestInit;
  enabled?: boolean;
  options?: UseAppQueryOptions<TData, TError>;
}) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => fetcher<TData>({ endpoint, config }),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 min - shorter for admin data that changes
    refetchOnWindowFocus: false,
    ...options,
  });
}
