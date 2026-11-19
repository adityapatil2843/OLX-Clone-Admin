"use client";

import * as React from "react";
import { ServerReel, ServerCategory } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Film,
  Play,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Volume2,
  Clock,
  Archive,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export default function ReelsModerationPage() {
  const [reels, setReels] = React.useState<ServerReel[]>([]);
  const [categories, setCategories] = React.useState<ServerCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [previewReel, setPreviewReel] = React.useState<ServerReel | null>(null);

  // Moderation action modal
  const [actionModal, setActionModal] = React.useState<{
    open: boolean;
    reel: ServerReel | null;
    status: "PUBLISHED" | "DRAFT" | "PROCESSING" | "FAILED" | "ARCHIVED";
    reason: string;
  }>({
    open: false,
    reel: null,
    status: "ARCHIVED",
    reason: "",
  });

  const [submitting, setSubmitting] = React.useState(false);

  // Load categories
  React.useEffect(() => {
    adminApi.listCategories(false)
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  const loadReels = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listReels({
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        page,
        limit: 12,
      });
      setReels(response.data);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reels from backend");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page]);

  React.useEffect(() => {
    void loadReels();
  }, [loadReels]);

  const displayedReels = React.useMemo(() => {
    return reels.filter((r) => {
      if (statusFilter === "all") return true;
      return r.visibilityState === statusFilter;
    });
  }, [reels, statusFilter]);

  const handleExecuteAction = async () => {
    if (!actionModal.reel) return;
    const { reel, status, reason } = actionModal;

    setSubmitting(true);
    try {
      await adminApi.moderateReel(reel.id, status, reason.trim() || undefined);
      toast.success(`Reel visibility updated to ${status}`);
      setActionModal((prev) => ({ ...prev, open: false, reason: "" }));
      if (previewReel?.id === reel.id) setPreviewReel(null);
      await loadReels();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to moderate reel");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ServerReel["visibilityState"]) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">PUBLISHED</Badge>;
      case "DRAFT":
        return <Badge variant="warning">DRAFT</Badge>;
      case "ARCHIVED":
        return <Badge variant="destructive">ARCHIVED</Badge>;
      case "MODERATED":
        return <Badge variant="secondary">MODERATED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Film className="h-6 w-6 text-sky-600" />
            Short-Video Reel Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review video-first product walkarounds, creator accounts, and manage distribution status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadReels()}
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
            <span>Error fetching reels: {error}</span>
            <Button size="sm" variant="outline" onClick={() => void loadReels()} className="h-7 text-xs bg-white">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 text-xs h-9"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 text-xs h-9"
          >
            <option value="all">All Visibility States</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="MODERATED">MODERATED</option>
          </Select>
        </CardContent>
      </Card>

      {/* Video Reel Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
            <span>Loading reels from database...</span>
          </div>
        </div>
      ) : displayedReels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-xs text-slate-500">
            No video reels found matching your filter criteria.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedReels.map((reel) => {
            const videoUrl =
              reel.mediaAsset?.storageKey && reel.mediaAsset.storageKey.startsWith("http")
                ? reel.mediaAsset.storageKey
                : `https://res.cloudinary.com/demo/video/upload/${reel.mediaAsset?.storageKey || ""}`;

            return (
              <Card
                key={reel.id}
                className="overflow-hidden border border-slate-200/90 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[9/10] w-full bg-slate-900 overflow-hidden group">
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      {getStatusBadge(reel.visibilityState)}
                    </div>

                    {/* Play Button Trigger */}
                    <button
                      type="button"
                      onClick={() => setPreviewReel(reel)}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                    >
                      <div className="h-12 w-12 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-white ml-0.5" />
                      </div>
                    </button>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Reel Bottom Meta */}
                    <div className="absolute bottom-3 inset-x-3 text-white z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-5 w-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {(reel.creator?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold truncate text-slate-100">
                          {reel.creator?.name || "Creator"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white line-clamp-2 leading-snug">
                        {reel.caption || "No caption provided"}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Category: {reel.category?.name || "General"}</span>
                      <span>{formatRelativeTime(reel.createdAt)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      ID: {reel.id}
                    </span>
                  </div>
                </div>

                {/* Moderation Controls Footer */}
                <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 flex-1"
                    onClick={() => setPreviewReel(reel)}
                  >
                    Inspect
                  </Button>
                  {reel.visibilityState === "PUBLISHED" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-8 flex-1"
                      onClick={() =>
                        setActionModal({
                          open: true,
                          reel,
                          status: "ARCHIVED",
                          reason: "",
                        })
                      }
                    >
                      Take Down
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      className="text-xs h-8 flex-1"
                      onClick={() =>
                        setActionModal({
                          open: true,
                          reel,
                          status: "PUBLISHED",
                          reason: "",
                        })
                      }
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500">
          <span>Page {meta.page} of {meta.totalPages} ({meta.total} total reels)</span>
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

      {/* Video Preview & Review Modal */}
      {previewReel && (
        <Dialog open={!!previewReel} onOpenChange={() => setPreviewReel(null)}>
          <DialogHeader onClose={() => setPreviewReel(null)}>
            <DialogTitle>Reel Moderation Review</DialogTitle>
            <DialogDescription>
              Creator: {previewReel.creator?.name || "Creator"} • Uploaded {formatRelativeTime(previewReel.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            {/* Caption */}
            {previewReel.caption && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-800">
                <span className="font-semibold block text-slate-500 text-[10px] uppercase mb-0.5">Caption</span>
                <p>{previewReel.caption}</p>
              </div>
            )}

            {/* Media Information */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <span className="font-semibold block text-slate-500 text-[10px] uppercase">Media Storage</span>
              <p className="font-mono text-[11px] truncate text-slate-700">
                Key: {previewReel.mediaAsset?.storageKey || "None"}
              </p>
              <p className="text-[11px] text-slate-500">
                Processing State: {previewReel.mediaAsset?.processingState || "READY"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap justify-between items-center gap-2 w-full">
            <Button
              variant={previewReel.visibilityState === "PUBLISHED" ? "destructive" : "success"}
              size="sm"
              onClick={() => {
                setActionModal({
                  open: true,
                  reel: previewReel,
                  status: previewReel.visibilityState === "PUBLISHED" ? "ARCHIVED" : "PUBLISHED",
                  reason: "",
                });
              }}
            >
              {previewReel.visibilityState === "PUBLISHED" ? "Archive / Take Down" : "Publish Reel"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreviewReel(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Moderation Confirmation Modal */}
      {actionModal.open && (
        <Dialog
          open={actionModal.open}
          onOpenChange={(open) => setActionModal((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setActionModal((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {actionModal.status === "ARCHIVED" ? "Archive / Take Down Video Reel?" : `Set Visibility to ${actionModal.status}?`}
            </DialogTitle>
            <DialogDescription>
              Target reel: {actionModal.reel?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Moderation Reason (Optional, logged to Audit Trail)
              </label>
              <Input
                placeholder="e.g. Explicit content / Fraudulent pricing / Approved"
                value={actionModal.reason}
                onChange={(e) => setActionModal((prev) => ({ ...prev, reason: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.status === "ARCHIVED" ? "destructive" : "default"}
              size="sm"
              disabled={submitting}
              onClick={handleExecuteAction}
            >
              {submitting ? "Processing..." : "Confirm Action"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
