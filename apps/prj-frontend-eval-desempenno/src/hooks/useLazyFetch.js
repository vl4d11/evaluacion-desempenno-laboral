import { useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const useLazyFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runFetch = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    const {responseType, ...fetchOptions } = options;
    try {
      const finalUrl = `${API_BASE}${url}`;

      const res = await fetch(finalUrl, fetchOptions);
      if(!res.ok){
        throw new Error(`HTTP ${res.status}`);
      }
      if(responseType === "blob"){
        return await res.blob();
      }

      const text = await res.text();
      setData(text);
      return text;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, runFetch };
};

export default useLazyFetch;
