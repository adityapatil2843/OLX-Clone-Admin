"use client";

export { useAdminMetrics } from "@/features/metrics/hooks";
import * as React from "react";
import { reportsApi } from "@/features/reports/api";
import { auditLogsApi } from "@/features/audit-logs/api";
import type { AdminReport } from "@/features/reports/types";
import type { AdminAuditLog } from "@/features/audit-logs/types";
import type { ApiResponseEnvelope } from "@/lib/api-client";

export function useAdminReports(page = 1, limit = 20) {
  const [data, setData] = React.useState<ApiResponseEnvelope<AdminReport[]> | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const fetchReports = React.useCallback(async () => {
    try {
      const res = await reportsApi.list(page, limit);
      setData(res);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const reload = React.useCallback(async () => {
    setLoading(true);
    await fetchReports();
  }, [fetchReports]);

  React.useEffect(() => {
    let active = true;
    reportsApi
      .list(page, limit)
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Request failed");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, limit]);

  return { data, loading, error, reload };
}

export function useAdminAuditLogs(page = 1, limit = 20) {
  const [data, setData] = React.useState<ApiResponseEnvelope<AdminAuditLog[]> | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const fetchLogs = React.useCallback(async () => {
    try {
      const res = await auditLogsApi.list(page, limit);
      setData(res);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const reload = React.useCallback(async () => {
    setLoading(true);
    await fetchLogs();
  }, [fetchLogs]);

  React.useEffect(() => {
    let active = true;
    auditLogsApi
      .list(page, limit)
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Request failed");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, limit]);

  return { data, loading, error, reload };
}
