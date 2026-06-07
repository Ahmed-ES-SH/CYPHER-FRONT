/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  hasPagination: boolean;
}

export function useFetchData<T = any>(url: string): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPagination, setHasPagination] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<T>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`,
        );

        if (!isMounted) return;

        setData(response.data);

        if (
          response.data && // افتراضياً، نفحص وجود حقول خاصة بالصفحات
          ((response.data as any).page !== undefined ||
            (response.data as any).pagination !== undefined)
        ) {
          setHasPagination(true);
        } else {
          setHasPagination(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error, hasPagination };
}
