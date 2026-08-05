import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export function useFetch<T>(url: string, initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, error, refetch: fetchData };
}

export default useFetch;
