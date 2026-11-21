"use client";

import * as React from "react";
import { metricsApi } from "./api";
import type { AdminMetrics } from "./types";

export function useAdminMetrics() {
  const [data, setData] = React.useState<AdminMetrics | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const fetchMetrics = React.useCallback(async () => {
    try {
      const res = await metricsApi.get();
      setData(res);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = React.useCallback(async () => {
    setLoading(true);
    await fetchMetrics();
  }, [fetchMetrics]);

  React.useEffect(() => {
    let active = true;
    metricsApi
      .get()
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load admin metrics");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error, reload };
}
