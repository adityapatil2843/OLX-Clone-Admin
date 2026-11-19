"use client";

import * as React from "react";
import { adminApi } from "./api";

export function useAdminMetrics() {
  return useResource(adminApi.getMetrics);
}

export function useAdminReports(page = 1, limit = 20) {
  const loader = React.useCallback(() => adminApi.listReports(page, limit), [page, limit]);
  return useResource(loader);
}

export function useAdminAuditLogs(page = 1, limit = 20) {
  const loader = React.useCallback(() => adminApi.listAuditLogs(page, limit), [page, limit]);
  return useResource(loader);
}

function useResource<T>(loader: () => Promise<T>) {
  const [state, setState] = React.useState<{ data?: T; loading: boolean; error?: string }>({ loading: true });
  const reload = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      setState({ data: await loader(), loading: false });
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Request failed" });
    }
  }, [loader]);

  // This effect starts the external request; the request callback updates state asynchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}
