"use client";

import * as React from "react";
import { ServerListing, ServerCategory } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Film,
  MapPin,
  RefreshCw,
  Eye,
  Archive,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ListingsPage() {
  const [listings, setListings] = React.useState<ServerListing[]>([]);
  const [categories, setCategories] = React.useState<ServerCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [selectedListing, setSelectedListing] = React.useState<ServerListing | null>(null);

  // Moderation action modal
  const [actionModal, setActionModal] = React.useState<{
    open: boolean;
    listing: ServerListing | null;
    status: "ACTIVE" | "DRAFT" | "SOLD" | "ARCHIVED";
    reason: string;
  }>({
    open: false,
    listing: null,
    status: "ARCHIVED",
    reason: "",
  });

  const [submitting, setSubmitting] = React.useState(false);

  // Load categories for filter dropdown
  React.useEffect(() => {
    adminApi.listCategories(false)
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  const loadListings = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listListings({
        search,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        page,
        limit: 20,
      });
      setListings(response.data);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings from backend");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadListings]);

  const displayedListings = React.useMemo(() => {
    return listings.filter((l) => {
      if (statusFilter === "all") return true;
      return l.status === statusFilter;
    });
  }, [listings, statusFilter]);

  const handleExecuteAction = async () => {
    if (!actionModal.listing) return;
    const { listing, status, reason } = actionModal;

    setSubmitting(true);
    try {
      await adminApi.moderateListing(listing.id, status, reason.trim() || undefined);
      toast.success(`Listing status updated to ${status}`);
      setActionModal((prev) => ({ ...prev, open: false, reason: "" }));
      if (selectedListing?.id === listing.id) setSelectedListing(null);
      await loadListings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to moderate listing");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: ServerListing["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>;
      case "DRAFT":
        return <Badge variant="warning">DRAFT</Badge>;
      case "SOLD":
        return <Badge variant="secondary">SOLD</Badge>;
      case "ARCHIVED":
        return <Badge variant="destructive">ARCHIVED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Marketplace Listing Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative catalog moderation connected to live backend. Review pricing, media, and status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadListings()}
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
            <span>Error fetching listings: {error}</span>
            <Button size="sm" variant="outline" onClick={() => void loadListings()} className="h-7 text-xs bg-white">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, description, or locality..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full md:w-48 text-xs h-9"
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
              className="w-full md:w-36 text-xs h-9"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SOLD">SOLD</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Catalog Inventory</CardTitle>
            <CardDescription>
              Showing {displayedListings.length} of {meta.total} records (Page {meta.page} of {meta.totalPages || 1})
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Listing Item</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Price</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Seller</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                      <span>Loading marketplace listings from database...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No listings match the current filters.
                  </td>
                </tr>
              ) : (
                displayedListings.map((item) => {
                  const primaryMedia = item.media && item.media.length > 0 ? item.media[0] : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Item Thumbnail & Title */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 max-w-sm">
                          <div className="relative shrink-0 h-11 w-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {primaryMedia?.url || primaryMedia?.thumbnailKey ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={primaryMedia.url || primaryMedia.thumbnailKey || ""}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3">
                        <span className="text-slate-900 block">{item.category?.name || "General"}</span>
                        {item.category?.slug && (
                          <span className="text-[11px] text-slate-400 block font-mono">/{item.category.slug}</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatINR(Number(item.price))}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-3">
                        <span className="text-slate-900 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {item.locationCity || "India"}
                        </span>
                        {item.locationLocality && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[120px]">
                            {item.locationLocality}
                          </span>
                        )}
                      </td>

                      {/* Seller */}
                      <td className="px-5 py-3">
                        <span className="text-slate-900 font-semibold block">{item.owner?.name || "Seller"}</span>
                        <span className="text-[11px] text-slate-400 block">{item.contactPhone}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">{getStatusBadge(item.status)}</td>

                      {/* Moderation Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => setSelectedListing(item)}
                          >
                            Details
                          </Button>
                          {item.status === "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 text-xs"
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  listing: item,
                                  status: "ARCHIVED",
                                  reason: "",
                                })
                              }
                            >
                              Take Down
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="success"
                              className="h-8 text-xs"
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  listing: item,
                                  status: "ACTIVE",
                                  reason: "",
                                })
                              }
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Listing Details Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogHeader onClose={() => setSelectedListing(null)}>
            <DialogTitle>{selectedListing.title}</DialogTitle>
            <DialogDescription>
              Listed by {selectedListing.owner?.name || "Seller"} in {selectedListing.locationCity || "India"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            {/* Price Banner */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Asking Price</span>
                <span className="text-xl font-bold">{formatINR(Number(selectedListing.price))}</span>
              </div>
              <div>
                {getStatusBadge(selectedListing.status)}
              </div>
            </div>

            {/* Description */}
            {selectedListing.description && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Description:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedListing.description}
                </p>
              </div>
            )}

            {/* Attributes */}
            {selectedListing.attributes && typeof selectedListing.attributes === "object" && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Custom Attributes:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(selectedListing.attributes).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-semibold text-slate-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-wrap justify-between items-center gap-2 w-full">
            <div className="flex gap-2">
              <Button
                variant={selectedListing.status === "ACTIVE" ? "destructive" : "success"}
                size="sm"
                onClick={() =>
                  setActionModal({
                    open: true,
                    listing: selectedListing,
                    status: selectedListing.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE",
                    reason: "",
                  })
                }
              >
                {selectedListing.status === "ACTIVE" ? "Archive / Take Down" : "Mark Active"}
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Confirmation & Reason Modal */}
      {actionModal.open && (
        <Dialog
          open={actionModal.open}
          onOpenChange={(open) => setActionModal((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setActionModal((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {actionModal.status === "ARCHIVED" ? "Take Down / Archive Listing?" : `Set Status to ${actionModal.status}?`}
            </DialogTitle>
            <DialogDescription>
              Target item: {actionModal.listing?.title} ({actionModal.listing?.id})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Moderation Reason (Optional, logged to Audit Trail)
              </label>
              <Input
                placeholder="e.g. Price misleading / Inappropriate media / Approved"
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
