import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const fetchCache = new Map();

export const clearFetchCache = () => {
  fetchCache.clear();
};

export const useFetch = (url) => {
  const cached = fetchCache.get(url);
  const [data, setData] = useState(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;

    const finalUrl = `${API_BASE}${url}`;

    fetch(finalUrl)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;

        const rows = text.trim().split("^");
        fetchCache.set(url, rows);
        setData(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, cached]);

  return { data, loading, error };
};
