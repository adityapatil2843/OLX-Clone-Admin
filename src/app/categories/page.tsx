"use client";

import * as React from "react";
import { ServerCategory } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";

export default function CategoryManagementPage() {
  const [categories, setCategories] = React.useState<ServerCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

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

  // Deactivate confirm modal
  const [deactivateModal, setDeactivateModal] = React.useState<{
    open: boolean;
    category: ServerCategory | null;
  }>({
    open: false,
    category: null,
  });

  const loadCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listCategories(true);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories from backend");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });
  }, [categories, search]);

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
        await adminApi.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          parentId: parentId === "none" ? null : parentId,
          displayOrder: Number(displayOrder),
        });
        toast.success(`Category "${name}" updated successfully!`);
        setEditingCategory(null);
      } else {
        await adminApi.createCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          parentId: parentId === "none" ? null : parentId,
          displayOrder: Number(displayOrder),
        });
        toast.success(`Category "${name}" created successfully!`);
        setIsAddCategoryOpen(false);
      }
      await loadCategories();
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
      await adminApi.deleteCategory(cat.id);
      toast.success(`Category "${cat.name}" deactivated`);
      setDeactivateModal({ open: false, category: null });
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate category");
    } finally {
      setSubmitting(false);
    }
  };

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
            onClick={() => void loadCategories()}
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
        <Card className="border-rose-200 bg-rose-50 text-rose-900">
          <CardContent className="py-3 text-xs flex items-center justify-between">
            <span>Error fetching categories: {error}</span>
            <Button size="sm" variant="outline" onClick={() => void loadCategories()} className="h-7 text-xs bg-white">
              Retry
            </Button>
          </CardContent>
        </Card>
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
              className="pl-9 h-9 text-xs"
            />
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
        <Card>
          <CardContent className="py-16 text-center text-xs text-slate-500">
            No categories found. Click &quot;Add Category&quot; to create a new category in the database.
          </CardContent>
        </Card>
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
                      <span className="text-xs text-slate-500 font-mono">
                        Slug: /{cat.slug} • Order: {cat.displayOrder} • {subcategories.length} subcategories
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      onClick={() => setDeactivateModal({ open: true, category: cat })}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Deactivate
                    </Button>
                    <div className="p-1 text-slate-400 cursor-pointer" onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}>
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </div>

                {/* Subcategories Accordion */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subcategories ({subcategories.length})
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setName("");
                          setSlug("");
                          setDescription("");
                          setParentId(cat.id);
                          setDisplayOrder(0);
                          setIsAddCategoryOpen(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Child to {cat.name}
                      </Button>
                    </div>

                    {subcategories.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                        No child subcategories for {cat.name}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-slate-900 block truncate">{sub.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">/{sub.slug}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleOpenEdit(sub)}
                                title="Edit"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 w-7 p-0"
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
          <DialogTitle>{editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}</DialogTitle>
          <DialogDescription>
            Configure marketplace taxonomy and hierarchy stored in the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveCategory} className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
            <Input
              placeholder="e.g. Electric Vehicles"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">URL Slug (lowercase-with-hyphens)</label>
            <Input
              placeholder="e.g. electric-vehicles"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Parent Category</label>
            <Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="h-9 text-xs"
            >
              <option value="none">None (Top-Level Category)</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description (Optional)</label>
            <Input
              placeholder="Brief description for marketplace browsing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Display Order</label>
            <Input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setIsAddCategoryOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Deactivate Category Confirmation Dialog */}
      {deactivateModal.open && (
        <Dialog
          open={deactivateModal.open}
          onOpenChange={(open) => setDeactivateModal((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setDeactivateModal((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>Deactivate Category?</DialogTitle>
            <DialogDescription>
              Category: {deactivateModal.category?.name} ({deactivateModal.category?.slug})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 text-xs text-slate-600 leading-relaxed">
            Deactivating this category will set its status to inactive (`isActive: false`) on the server. Active listings under this category will remain preserved in the database.
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setDeactivateModal({ open: false, category: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={submitting}
              onClick={handleDeactivate}
            >
              {submitting ? "Deactivating..." : "Confirm Deactivation"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
