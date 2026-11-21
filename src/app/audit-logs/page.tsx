"use client";

import * as React from "react";
import type { AdminAuditLog } from "@/features/audit-logs/types";
import type { AdminPageMeta } from "@/features/shared/types";
import { auditLogsApi } from "@/features/audit-logs/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { OfflineState } from "@/components/ui/offline-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce, useNetworkStatus } from "@/hooks";
import {
  History,
  Search,
  RefreshCw,
  FileCode,
  X,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const isOnline = useNetworkStatus();
  const [logs, setLogs] = React.useState<AdminAuditLog[]>([]);
  const [meta, setMeta] = React.useState<AdminPageMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [selectedLog, setSelectedLog] = React.useState<AdminAuditLog | null>(null);
  const [reloadCounter, setReloadCounter] = React.useState(0);

  // Race-condition immune data fetch
  React.useEffect(() => {
    let isCurrent = true;

    auditLogsApi
      .list(page, limit)
      .then((res) => {
        if (!isCurrent) return;
        setLogs(res.data || []);
        if (res.meta) {
          setMeta(res.meta);
        }
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        const message = err instanceof Error ? err.message : "Failed to load audit logs from server.";
        setError(message);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [page, limit, reloadCounter]);

  const filteredLogs = React.useMemo(() => {
    if (!debouncedSearch.trim()) return logs;
    const q = debouncedSearch.toLowerCase();
    return logs.filter((log) => {
      const adminText = log.admin?.name || log.admin?.email || log.adminId;
      const actionText = log.action || "";
      const targetText = `${log.targetType} ${log.targetId}`;
      const detailsText = log.details ? JSON.stringify(log.details) : "";
      return (
        adminText.toLowerCase().includes(q) ||
        actionText.toLowerCase().includes(q) ||
        targetText.toLowerCase().includes(q) ||
        detailsText.toLowerCase().includes(q)
      );
    });
  }, [logs, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLoading(true);
    setLimit(newLimit);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const getActionBadge = (action: string) => {
    if (action.includes("DELETE") || action.includes("SUSPEND")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes("RESOLVE") || action.includes("APPROVE") || action.includes("ACTIVE")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes("MODERATE")) {
      return <Badge variant="warning">{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  if (!isOnline) {
    return (
      <div className="py-12">
        <OfflineState
          onRetry={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="h-6 w-6 text-sky-600" />
            Security & Administrative Audit Trails
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of moderation interventions, user status updates, and report resolutions recorded on the server.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
          disabled={loading}
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter / Search Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Filter current view by admin name, action, target entity, or details payload..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-9 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 rounded-full p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Unable to fetch audit logs"
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
        />
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Administrative Actions</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {meta.total} server audit events recorded (Page {meta.page} of {meta.totalPages || 1})
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">Admin / Moderator</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Target Entity</th>
                <th className="px-5 py-3 font-semibold">Details Summary</th>
                <th className="px-5 py-3 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-sans">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading audit trail from server...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 font-sans">
                    <EmptyState
                      icon={History}
                      title="No Audit Logs Found"
                      description={
                        search
                          ? `No logs match "${search}". Try searching with a different keyword.`
                          : "No administrative audit events have been recorded yet."
                      }
                      actionLabel={search ? "Clear Search" : undefined}
                      onAction={search ? handleClearSearch : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap font-sans text-xs">
                      {formatDate(log.createdAt)}
                    </td>

                    {/* Admin User */}
                    <td className="px-5 py-3 font-sans text-xs">
                      <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                        {log.admin?.name || log.admin?.email || "Staff Admin"}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {log.admin?.role || log.adminId}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 font-sans">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Target Entity */}
                    <td className="px-5 py-3 font-sans">
                      <span className="text-slate-900 font-semibold block text-xs">
                        {log.targetType}
                      </span>
                      <span className="text-slate-400 block text-[10px] font-mono truncate max-w-[140px]">
                        {log.targetId}
                      </span>
                    </td>

                    {/* Details Summary */}
                    <td className="px-5 py-3 font-sans text-slate-600 max-w-xs truncate">
                      {log.details ? (
                        <span className="text-xs truncate block text-slate-700">
                          {typeof log.details === "object"
                            ? Object.entries(log.details)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" | ")
                            : String(log.details)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No extra details</span>
                      )}
                    </td>

                    {/* Inspect Modal Trigger */}
                    <td className="px-5 py-3 text-right font-sans">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => setSelectedLog(log)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Enterprise Reusable Pagination */}
        <div className="border-t border-slate-100 p-2">
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </Card>

      {/* Inspect Log Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogHeader onClose={() => setSelectedLog(null)}>
            <div className="flex items-center gap-2">
              <DialogTitle>Audit Record #{selectedLog.id}</DialogTitle>
              {getActionBadge(selectedLog.action)}
            </div>
            <DialogDescription>
              Recorded on {formatDate(selectedLog.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Initiating Admin:</span>
                <span className="font-bold text-slate-900">
                  {selectedLog.admin?.name || "Staff Admin"} ({selectedLog.admin?.role || "STAFF"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin Staff ID:</span>
                <span className="font-mono text-slate-700">{selectedLog.adminId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Type:</span>
                <span className="font-bold text-slate-900">{selectedLog.targetType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target ID:</span>
                <span className="font-mono text-slate-700">{selectedLog.targetId}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-sky-600" />
                Raw Event Payload (JSON):
              </span>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.details, null, 2) || "No extra metadata recorded."}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedLog(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
