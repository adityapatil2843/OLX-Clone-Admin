"use client";

import * as React from "react";
import { AdminAuditLog, AdminPageMeta } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  History,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileCode,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AdminAuditLog[]>([]);
  const [meta, setMeta] = React.useState<AdminPageMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AdminAuditLog | null>(null);

  const fetchLogs = React.useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listAuditLogs(targetPage, 20);
      setLogs(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load audit logs from server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs(page);
  }, [fetchLogs, page]);

  const filteredLogs = React.useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
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
  }, [logs, search]);

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
          onClick={() => fetchLogs(page)}
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
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to fetch audit logs</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchLogs(page)}>
            Retry
          </Button>
        </div>
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Administrative Actions</CardTitle>
            <CardDescription>
              Page {meta.page} of {meta.totalPages || 1} • Total {meta.total} server audit events recorded
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
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-sans">
                    No administrative audit logs found.
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
                                .join(", ")
                            : String(log.details)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Inspect Details */}
                    <td className="px-5 py-3 text-right font-sans">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Payload
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing page {meta.page} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!meta.hasNextPage && meta.page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Inspect Log Modal */}
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
