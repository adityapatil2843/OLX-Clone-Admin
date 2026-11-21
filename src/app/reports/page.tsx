"use client";

import * as React from "react";
import type { AdminReport, AdminReportStatus } from "@/features/reports/types";
import { reportsApi } from "@/features/reports/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { OfflineState } from "@/components/ui/offline-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useNetworkStatus } from "@/hooks";
import {
  AlertOctagon,
  User,
  ShoppingBag,
  Film,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsQueuePage() {
  const isOnline = useNetworkStatus();
  const [reports, setReports] = React.useState<AdminReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [statusFilter, setStatusFilter] = React.useState<string>("PENDING");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
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
  const [reloadCounter, setReloadCounter] = React.useState(0);

  // Race-condition immune load
  React.useEffect(() => {
    let isCurrent = true;

    reportsApi
      .list(page, limit, statusFilter !== "all" ? statusFilter : undefined)
      .then((response) => {
        if (!isCurrent) return;
        setReports(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to load reports from backend");
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [page, limit, statusFilter, reloadCounter]);

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLoading(true);
    setLimit(newLimit);
    setPage(1);
  };

  const handleExecuteResolution = async () => {
    if (!resolveDialog.report) return;
    const { report, status, resolutionNotes } = resolveDialog;

    setSubmitting(true);
    try {
      await reportsApi.resolve(report.id, status, resolutionNotes.trim() || undefined);
      toast.success(`Report #${report.id} marked as ${status}`);
      setResolveDialog((prev) => ({ ...prev, open: false, resolutionNotes: "" }));
      if (selectedReport?.id === report.id) setSelectedReport(null);
      setLoading(true);
      setReloadCounter((prev) => prev + 1);
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
        return <Badge variant="warning">PENDING</Badge>;
      case "REVIEWED":
        return <Badge variant="default">REVIEWED</Badge>;
      case "RESOLVED":
        return <Badge variant="success">RESOLVED</Badge>;
      case "DISMISSED":
        return <Badge variant="secondary">DISMISSED</Badge>;
    }
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Enforcement & Trust
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Reports & Moderation Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complaints submitted by users against listings, reels, or bad actors. Real-time moderation actions recorded to the database.
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
          className="text-xs h-9 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Queue
        </Button>
      </div>

      {error && (
        <ErrorState
          title="Error fetching reports"
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
        />
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Filter Status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs h-9 w-full sm:w-44"
            >
              <option value="all">All Complaints</option>
              <option value="PENDING">Pending Triage</option>
              <option value="REVIEWED">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </Select>
          </div>

          <span className="text-xs text-slate-400">
            Total complaints: <strong className="text-slate-800">{meta.total}</strong>
          </span>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base">Complaints Inbox</CardTitle>
          <CardDescription>
            Showing {reports.length} of {meta.total} cases (Page {meta.page} of {meta.totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Target Entity</th>
                <th className="px-5 py-3 font-semibold">Violation Reason</th>
                <th className="px-5 py-3 font-semibold">Reported By</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold text-right">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                      <span>Loading reports queue from server...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={AlertOctagon}
                      title="Queue Clean"
                      description={
                        statusFilter === "PENDING"
                          ? "No pending reports require moderation attention right now."
                          : "No complaints found under the selected status filter."
                      }
                    />
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Target Entity */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                          {getTargetIcon(report.targetType)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {report.targetType}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            ID: {report.targetId.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-3">
                      <div>
                        <span className="font-semibold text-rose-700 block">
                          {report.reason}
                        </span>
                        {report.details && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs" title={report.details}>
                            {report.details}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-3">
                      <div>
                        <span className="text-slate-800 font-medium block">
                          {report.reporter?.name || "User"}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          ID: {report.reporterId.slice(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      {getStatusBadge(report.status)}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      <div>
                        <span className="block">{formatRelativeTime(report.createdAt)}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatDate(report.createdAt, "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
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

          <DialogFooter className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {selectedReport.status === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setResolveDialog({
                        open: true,
                        report: selectedReport,
                        status: "RESOLVED",
                        resolutionNotes: "",
                      });
                    }}
                  >
                    Resolve Complaint
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setResolveDialog({
                        open: true,
                        report: selectedReport,
                        status: "DISMISSED",
                        resolutionNotes: "",
                      });
                    }}
                  >
                    Dismiss Complaint
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Resolution Dialog Modal */}
      {resolveDialog.open && (
        <Dialog
          open={resolveDialog.open}
          onOpenChange={(open) => setResolveDialog((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setResolveDialog((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {resolveDialog.status === "RESOLVED"
                ? "Mark Complaint as Resolved"
                : resolveDialog.status === "DISMISSED"
                ? "Dismiss Complaint"
                : "Move to Reviewed"}
            </DialogTitle>
            <DialogDescription>
              Report #{resolveDialog.report?.id} against {resolveDialog.report?.targetType}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Resolution Notes (Visible to internal staff)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Content taken down per seller policy violation / Verified false report"
                value={resolveDialog.resolutionNotes}
                onChange={(e) =>
                  setResolveDialog((prev) => ({ ...prev, resolutionNotes: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
              variant={resolveDialog.status === "DISMISSED" ? "outline" : "default"}
              size="sm"
              disabled={submitting}
              onClick={handleExecuteResolution}
            >
              {submitting ? "Submitting..." : `Confirm ${resolveDialog.status}`}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
