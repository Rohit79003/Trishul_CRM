import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface UseFetchOptions {
  showGlobalLoader?: boolean;
}

export function useFetch<T>(
  url: string,
  initialData: T | null = null,
  options: UseFetchOptions = { showGlobalLoader: true }
) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url, {
        showGlobalLoader: options.showGlobalLoader ?? true,
      });
      setData(response.data);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to server. Please check backend server connection."
          : err?.message || "Failed to fetch data");
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [url, options.showGlobalLoader]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
