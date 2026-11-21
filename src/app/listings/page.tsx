"use client";

import * as React from "react";
import type { ServerListing } from "@/features/listings/types";
import type { ServerCategory } from "@/features/categories/types";
import { listingsApi } from "@/features/listings/api";
import { categoriesApi } from "@/features/categories/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { OfflineState } from "@/components/ui/offline-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce, useNetworkStatus } from "@/hooks";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Film,
  MapPin,
  RefreshCw,
  Eye,
  ShoppingBag,
  X,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ListingsPage() {
  const isOnline = useNetworkStatus();
  const [listings, setListings] = React.useState<ServerListing[]>([]);
  const [categories, setCategories] = React.useState<ServerCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Pagination
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
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
  const [reloadCounter, setReloadCounter] = React.useState(0);

  // Load categories for filter dropdown
  React.useEffect(() => {
    categoriesApi
      .list(false)
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  // Race-condition immune data fetch
  React.useEffect(() => {
    let isCurrent = true;

    listingsApi
      .list({
        search: debouncedSearch.trim() || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        page,
        limit,
      })
      .then((response) => {
        if (!isCurrent) return;
        setListings(response.data);
        if (response.meta) {
          setMeta(response.meta);
        }
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to load listings from backend");
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, categoryFilter, page, limit, reloadCounter]);

  const displayedListings = React.useMemo(() => {
    return listings.filter((l) => {
      if (statusFilter === "all") return true;
      return l.status === statusFilter;
    });
  }, [listings, statusFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    setLoading(true);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
    setLoading(true);
  };

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

  const handleExecuteAction = async () => {
    if (!actionModal.listing) return;
    const { listing, status, reason } = actionModal;

    setSubmitting(true);
    try {
      await listingsApi.moderate(listing.id, status, reason.trim() || undefined);
      toast.success(`Listing status updated to ${status}`);
      setActionModal((prev) => ({ ...prev, open: false, reason: "" }));
      if (selectedListing?.id === listing.id) setSelectedListing(null);
      setLoading(true);
      setReloadCounter((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to moderate listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setLoading(true);
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
          onClick={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
          disabled={loading}
          className="text-xs h-9 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <ErrorState
          title="Error fetching listings"
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
        />
      )}

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search listings by title or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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

          <div className="flex w-full md:w-auto items-center gap-2">
            <Select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full md:w-44 text-xs h-9"
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
              onChange={(e) => handleStatusChange(e.target.value)}
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
            <CardTitle className="text-base">Listing Inventory</CardTitle>
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
                <th className="px-5 py-3 font-semibold">Seller</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
                <th className="px-5 py-3 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                      <span>Loading catalog listings from server...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      icon={ShoppingBag}
                      title="No Listings Found"
                      description={
                        search
                          ? `No listings matched "${search}". Try searching with different keywords or clearing filters.`
                          : "No listings found matching the selected category and status filters."
                      }
                      actionLabel={search ? "Clear Search" : undefined}
                      onAction={search ? handleClearSearch : undefined}
                    />
                  </td>
                </tr>
              ) : (
                displayedListings.map((item) => {
                  const coverImage = item.media?.find((m) => m.type === "IMAGE")?.url;
                  const hasVideo = item.media?.some((m) => m.type === "VIDEO");

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Title & Thumbnail */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={coverImage}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-slate-400" />
                            )}
                            {hasVideo && (
                              <span
                                className="absolute bottom-0.5 right-0.5 rounded bg-black/70 p-0.5 text-white"
                                title="Video attached"
                              >
                                <Film className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-semibold text-slate-900 block truncate" title={item.title}>
                              {item.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              {item.locationCity && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {item.locationCity}
                                </span>
                              )}
                              <span>• ID: {item.id.slice(0, 8)}...</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.category?.name || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {formatINR(Number(item.price))}
                      </td>

                      {/* Seller */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 font-medium truncate max-w-[120px]">
                            {item.owner?.name || "Seller"}
                          </span>
                          {item.owner?.isVerifiedSeller && (
                            <span title="Verified Seller">
                              <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(item.createdAt, "dd MMM yyyy")}
                      </td>

                      {/* Moderation Actions */}
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => setSelectedListing(item)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
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

            {/* Location & Contact */}
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block">Location</span>
                <span className="font-medium text-slate-800">
                  {selectedListing.locationCity || "Not specified"}{selectedListing.locationState ? `, ${selectedListing.locationState}` : ""}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block">Contact Phone</span>
                <span className="font-medium text-slate-800">{selectedListing.contactPhone || "Not specified"}</span>
              </div>
            </div>

            {/* Media Gallery */}
            {selectedListing.media && selectedListing.media.length > 0 && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Attached Media Assets:</span>
                <div className="grid grid-cols-3 gap-2">
                  {selectedListing.media.map((m) => (
                    <div
                      key={m.id}
                      className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center"
                    >
                      {m.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt="Listing asset" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{m.type}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              {selectedListing.status === "ACTIVE" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setActionModal({
                      open: true,
                      listing: selectedListing,
                      status: "ARCHIVED",
                      reason: "",
                    })
                  }
                >
                  Take Down Listing
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() =>
                    setActionModal({
                      open: true,
                      listing: selectedListing,
                      status: "ACTIVE",
                      reason: "",
                    })
                  }
                >
                  Approve Listing
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedListing(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Moderation Reason Dialog */}
      {actionModal.open && (
        <Dialog
          open={actionModal.open}
          onOpenChange={(open) => setActionModal((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setActionModal((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {actionModal.status === "ACTIVE" ? "Approve Catalog Listing" : "Take Down Listing"}
            </DialogTitle>
            <DialogDescription>
              Action on: &ldquo;{actionModal.listing?.title}&rdquo; (ID: {actionModal.listing?.id})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            {actionModal.status === "ARCHIVED" && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Taking down this listing will hide it from buyer search and home feeds across web and mobile.</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Moderation Reason (Optional Audit Note)
              </label>
              <Input
                placeholder="e.g. Prohibited item / Incorrect pricing / Seller verified"
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
              {submitting ? "Processing..." : `Confirm ${actionModal.status}`}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
