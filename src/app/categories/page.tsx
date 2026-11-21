"use client";

import * as React from "react";
import type { ServerCategory } from "@/features/categories/types";
import { categoriesApi } from "@/features/categories/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { OfflineState } from "@/components/ui/offline-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce, useNetworkStatus } from "@/hooks";
import {
  FolderTree,
  Plus,
  ChevronDown,
  ChevronRight,
  Layers,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function CategoryManagementPage() {
  const isOnline = useNetworkStatus();
  const [categories, setCategories] = React.useState<ServerCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [expandedCategoryId, setExpandedCategoryId] = React.useState<string | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ServerCategory | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [parentId, setParentId] = React.useState<string>("none");
  const [displayOrder, setDisplayOrder] = React.useState<number>(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [reloadCounter, setReloadCounter] = React.useState(0);

  // Deactivate confirm modal
  const [deactivateModal, setDeactivateModal] = React.useState<{
    open: boolean;
    category: ServerCategory | null;
  }>({
    open: false,
    category: null,
  });

  // Race-condition immune data fetch
  React.useEffect(() => {
    let isCurrent = true;

    categoriesApi
      .list(true)
      .then((data) => {
        if (!isCurrent) return;
        setCategories(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to load categories from backend");
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadCounter]);

  const filteredCategories = React.useMemo(() => {
    if (!debouncedSearch.trim()) return categories;
    const q = debouncedSearch.toLowerCase();
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [categories, debouncedSearch]);

  const rootCategories = React.useMemo(() => {
    return filteredCategories.filter((c) => !c.parentId);
  }, [filteredCategories]);

  const handleOpenCreate = () => {
    setName("");
    setSlug("");
    setDescription("");
    setParentId("none");
    setDisplayOrder(0);
    setIsAddCategoryOpen(true);
  };

  const handleOpenEdit = (cat: ServerCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "none");
    setDisplayOrder(cat.displayOrder || 0);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          parentId: parentId === "none" ? null : parentId,
          displayOrder: Number(displayOrder),
        });
        toast.success(`Category "${name}" updated successfully!`);
        setEditingCategory(null);
      } else {
        await categoriesApi.create({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          parentId: parentId === "none" ? null : parentId,
          displayOrder: Number(displayOrder),
        });
        toast.success(`Category "${name}" created successfully!`);
        setIsAddCategoryOpen(false);
      }
      setLoading(true);
      setReloadCounter((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateModal.category) return;
    const cat = deactivateModal.category;

    setSubmitting(true);
    try {
      await categoriesApi.delete(cat.id);
      toast.success(`Category "${cat.name}" deactivated`);
      setDeactivateModal({ open: false, category: null });
      setLoading(true);
      setReloadCounter((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
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
            <FolderTree className="h-6 w-6 text-sky-600" />
            Marketplace Category Taxonomy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative taxonomy management. Create top-level categories, nest subcategories, and toggle visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <Button onClick={handleOpenCreate} size="sm" className="h-9 text-xs">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Error fetching categories"
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadCounter((prev) => prev + 1);
          }}
        />
      )}

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search category by name or slug..."
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

      {/* Category Tree List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
            <span>Loading categories from backend...</span>
          </div>
        </div>
      ) : rootCategories.length === 0 ? (
        <div className="py-8">
          <EmptyState
            icon={FolderTree}
            title="No Categories Found"
            description={
              search
                ? `No categories match "${search}". Try searching for another name.`
                : "No categories are configured yet. Click 'Add Category' to get started."
            }
            actionLabel={search ? "Clear Search" : "Add Category"}
            onAction={search ? handleClearSearch : handleOpenCreate}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {rootCategories.map((cat) => {
            const isExpanded = expandedCategoryId === cat.id;
            const subcategories = categories.filter((sub) => sub.parentId === cat.id);

            return (
              <Card key={cat.id} className="overflow-hidden border border-slate-200">
                {/* Category Header Row */}
                <div
                  className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-slate-100 border border-slate-200">
                      <Layers className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm">{cat.name}</h3>
                        <Badge variant={cat.isActive ? "success" : "secondary"}>
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Slug: <span className="font-mono text-slate-700">/{cat.slug}</span> • Order: {cat.displayOrder} • {subcategories.length} subcategories
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={() => setDeactivateModal({ open: true, category: cat })}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Deactivate
                    </Button>
                    <div className="p-1 text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Subcategories Expansion List */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-100 p-4 space-y-2">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                      <span className="text-xs font-semibold text-slate-600">
                        Subcategories of {cat.name} ({subcategories.length})
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-white"
                        onClick={() => {
                          setName("");
                          setSlug("");
                          setDescription("");
                          setParentId(cat.id);
                          setDisplayOrder(subcategories.length);
                          setIsAddCategoryOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Subcategory
                      </Button>
                    </div>

                    {subcategories.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No subcategories nested under {cat.name}.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-white p-3 rounded-lg border border-slate-200/80 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-slate-800 text-xs">{sub.name}</span>
                                <Badge variant={sub.isActive ? "success" : "secondary"} className="text-[10px] py-0 px-1.5">
                                  {sub.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                                /{sub.slug}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleOpenEdit(sub)}
                                title="Edit subcategory"
                              >
                                <Edit2 className="h-3 w-3 text-slate-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 border-rose-200"
                                onClick={() => setDeactivateModal({ open: true, category: sub })}
                                title="Deactivate"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Dialog */}
      <Dialog
        open={isAddCategoryOpen || !!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }
        }}
      >
        <DialogHeader
          onClose={() => {
            setIsAddCategoryOpen(false);
            setEditingCategory(null);
          }}
        >
          <DialogTitle>
            {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
          </DialogTitle>
          <DialogDescription>
            Categories define the marketplace navigation taxonomy and product filtering.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveCategory}>
          <div className="py-3 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Category Name *
              </label>
              <Input
                placeholder="e.g. Commercial Vehicles"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                URL Slug (Optional, auto-generated if left blank)
              </label>
              <Input
                placeholder="e.g. commercial-vehicles"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Parent Category
              </label>
              <Select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="none">None (Root Category)</option>
                {categories
                  .filter((c) => !c.parentId && (!editingCategory || c.id !== editingCategory.id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </Select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Description
              </label>
              <Input
                placeholder="Short description for SEO and buyers"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Display Order Priority
              </label>
              <Input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setIsAddCategoryOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Deactivate Modal */}
      {deactivateModal.open && (
        <Dialog
          open={deactivateModal.open}
          onOpenChange={(open) => setDeactivateModal((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setDeactivateModal({ open: false, category: null })}>
            <DialogTitle>Deactivate Category &quot;{deactivateModal.category?.name}&quot;?</DialogTitle>
            <DialogDescription>
              Deactivating will mark this category as inactive and hide it from buyer catalog browsing.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setDeactivateModal({ open: false, category: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={handleDeactivate}
            >
              {submitting ? "Deactivating..." : "Confirm Deactivate"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
