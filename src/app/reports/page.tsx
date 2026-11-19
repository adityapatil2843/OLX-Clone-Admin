"use client";

import * as React from "react";
import { AdminReport, AdminReportStatus } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  AlertOctagon,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  ShoppingBag,
  Film,
  ShieldAlert,
  RefreshCw,
  Clock,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsQueuePage() {
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [selectedReport, setSelectedReport] = React.useState<AdminReport | null>(null);

  // Resolution action dialog state
  const [resolveDialog, setResolveDialog] = React.useState<{
    open: boolean;
    report: AdminReport | null;
    status: "RESOLVED" | "DISMISSED" | "REVIEWED";
    resolutionNotes: string;
  }>({
    open: false,
    report: null,
    status: "RESOLVED",
    resolutionNotes: "",
  });

  const [submitting, setSubmitting] = React.useState(false);

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listReports(page, 20, statusFilter !== "all" ? statusFilter : undefined);
      setReports(response.data);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports from backend");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  React.useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleExecuteResolution = async () => {
    if (!resolveDialog.report) return;
    const { report, status, resolutionNotes } = resolveDialog;

    setSubmitting(true);
    try {
      await adminApi.resolveReport(report.id, status, resolutionNotes.trim() || undefined);
      toast.success(`Report #${report.id} marked as ${status}`);
      setResolveDialog((prev) => ({ ...prev, open: false, resolutionNotes: "" }));
      if (selectedReport?.id === report.id) setSelectedReport(null);
      await loadReports();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve report");
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetIcon = (type: AdminReport["targetType"]) => {
    switch (type) {
      case "USER":
        return <User className="h-4 w-4 text-purple-600" />;
      case "LISTING":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case "REEL":
        return <Film className="h-4 w-4 text-sky-600" />;
    }
  };

  const getStatusBadge = (status: AdminReportStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="destructive">PENDING</Badge>;
      case "REVIEWED":
        return <Badge variant="warning">REVIEWED</Badge>;
      case "RESOLVED":
        return <Badge variant="success">RESOLVED</Badge>;
      case "DISMISSED":
        return <Badge variant="secondary">DISMISSED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertOctagon className="h-6 w-6 text-rose-600" />
            Trust & Safety Reports Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative moderation inbox. Review user-submitted complaints for scams, policy violations, and harassment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadReports()}
          disabled={loading}
          className="text-xs h-9 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-900">
          <CardContent className="py-3 text-xs flex items-center justify-between">
            <span>Error fetching reports: {error}</span>
            <Button size="sm" variant="outline" onClick={() => void loadReports()} className="h-7 text-xs bg-white">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status Filter:</span>
            <div className="flex flex-wrap gap-1.5">
              {(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED", "all"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    statusFilter === st
                      ? "bg-slate-900 text-white border-transparent shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Moderation Queue Items</CardTitle>
            <CardDescription>
              Showing {reports.length} of {meta.total} records (Page {meta.page} of {meta.totalPages || 1})
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Target Entity</th>
                <th className="px-5 py-3 font-semibold">Violation Reason</th>
                <th className="px-5 py-3 font-semibold">Filed By</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                      <span>Loading reports from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No reports found for status &quot;{statusFilter}&quot;.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Target */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {getTargetIcon(report.targetType)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{report.targetType}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">ID: {report.targetId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Violation Reason */}
                    <td className="px-5 py-3 max-w-xs">
                      <span className="font-semibold text-rose-600 block line-clamp-1">{report.reason}</span>
                      {report.details && (
                        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{report.details}</span>
                      )}
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-3">
                      <span className="text-slate-900 block font-semibold">{report.reporter?.name || "User"}</span>
                      {report.reporter?.email && (
                        <span className="text-[11px] text-slate-400 block">{report.reporter.email}</span>
                      )}
                    </td>

                    {/* Submitted At */}
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(report.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">{getStatusBadge(report.status)}</td>

                    {/* Action buttons */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setSelectedReport(report)}
                        >
                          Review
                        </Button>
                        {report.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="success"
                            className="h-8 text-xs"
                            onClick={() =>
                              setResolveDialog({
                                open: true,
                                report,
                                status: "RESOLVED",
                                resolutionNotes: "",
                              })
                            }
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
            <span>Page {meta.page} of {meta.totalPages}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Report Review Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogHeader onClose={() => setSelectedReport(null)}>
            <div className="flex items-center gap-2">
              <DialogTitle>Complaint Review - #{selectedReport.id}</DialogTitle>
              {getStatusBadge(selectedReport.status)}
            </div>
            <DialogDescription>
              Reported on {formatDate(selectedReport.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            {/* Target Item summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Target Entity: {selectedReport.targetType}
              </span>
              <p className="font-mono text-slate-900 font-bold">{selectedReport.targetId}</p>
            </div>

            {/* Allegation details */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Violation Reason
              </span>
              <p className="font-semibold text-rose-600">{selectedReport.reason}</p>
              {selectedReport.details && (
                <p className="text-slate-700 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 leading-relaxed mt-1">
                  {selectedReport.details}
                </p>
              )}
            </div>

            {/* Reporter details */}
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Filed By</span>
                <span className="font-semibold text-slate-900">{selectedReport.reporter?.name || "User"}</span>
                {selectedReport.reporter?.email && (
                  <span className="text-slate-400 block">{selectedReport.reporter.email}</span>
                )}
              </div>
            </div>

            {/* Resolution History if resolved */}
            {selectedReport.resolutionNotes && (
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 space-y-0.5">
                <span className="font-bold block">Resolution Notes:</span>
                <p>{selectedReport.resolutionNotes}</p>
                {selectedReport.resolvedAt && (
                  <span className="text-[10px] text-emerald-700 block mt-1">
                    Resolved at: {formatDate(selectedReport.resolvedAt)}
                  </span>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-wrap justify-between items-center gap-2 w-full">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setResolveDialog({
                    open: true,
                    report: selectedReport,
                    status: "DISMISSED",
                    resolutionNotes: "Dismissed by admin review: No violation found",
                  });
                }}
              >
                Dismiss Report
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setResolveDialog({
                    open: true,
                    report: selectedReport,
                    status: "RESOLVED",
                    resolutionNotes: "Violation confirmed: Warning issued and content quarantined",
                  });
                }}
              >
                Resolve Report
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Resolution Confirmation Modal */}
      {resolveDialog.open && (
        <Dialog
          open={resolveDialog.open}
          onOpenChange={(open) => setResolveDialog((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setResolveDialog((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {resolveDialog.status === "DISMISSED" ? "Dismiss Complaint?" : "Resolve Complaint?"}
            </DialogTitle>
            <DialogDescription>
              Report #{resolveDialog.report?.id} ({resolveDialog.report?.targetType}: {resolveDialog.report?.targetId})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Resolution Notes (Logged to Audit Trail)
              </label>
              <Input
                placeholder="e.g. Investigation completed, user warned per terms"
                value={resolveDialog.resolutionNotes}
                onChange={(e) => setResolveDialog((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setResolveDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={resolveDialog.status === "DISMISSED" ? "destructive" : "success"}
              size="sm"
              disabled={submitting}
              onClick={handleExecuteResolution}
            >
              {submitting ? "Processing..." : `Confirm ${resolveDialog.status}`}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
