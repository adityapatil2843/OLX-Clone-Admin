"use client";

import * as React from "react";
import { ServerUser } from "@/features/admin/types";
import { adminApi } from "@/features/admin/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  UserCheck,
  UserX,
  Trash2,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = React.useState<ServerUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [selectedUser, setSelectedUser] = React.useState<ServerUser | null>(null);

  // Moderation state
  const [moderationDialog, setModerationDialog] = React.useState<{
    open: boolean;
    user: ServerUser | null;
    action: "change_role" | "toggle_status" | "delete";
    targetRole?: "USER" | "ADMIN" | "MODERATOR";
    targetStatus?: boolean;
    reason: string;
  }>({
    open: false,
    user: null,
    action: "change_role",
    reason: "",
  });

  const [submitting, setSubmitting] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.listUsers({ search, page, limit: 20 });
      setUsers(response.data);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users from backend");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // Client-side quick filter for role/status
  const displayedUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive !== false) ||
        (statusFilter === "inactive" && u.isActive === false);
      return matchesRole && matchesStatus;
    });
  }, [users, roleFilter, statusFilter]);

  const handleExecuteModeration = async () => {
    if (!moderationDialog.user) return;
    const { user, action, targetRole, targetStatus, reason } = moderationDialog;

    setSubmitting(true);
    try {
      if (action === "change_role" && targetRole) {
        await adminApi.moderateUser(user.id, { role: targetRole, reason: reason.trim() || undefined });
        toast.success(`Role updated for ${user.name} to ${targetRole}`);
      } else if (action === "toggle_status" && targetStatus !== undefined) {
        await adminApi.moderateUser(user.id, { isActive: targetStatus, reason: reason.trim() || undefined });
        toast.success(`User ${user.name} ${targetStatus ? "activated" : "deactivated"}`);
      } else if (action === "delete") {
        await adminApi.deleteUser(user.id);
        toast.success(`User ${user.name} soft-deleted successfully`);
      }

      setModerationDialog((prev) => ({ ...prev, open: false, reason: "" }));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Moderation action failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Account Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative user directory loaded from live server database. Manage staff roles and account states.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadUsers()}
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
            <span>Error fetching users: {error}</span>
            <Button size="sm" variant="outline" onClick={() => void loadUsers()} className="h-7 text-xs bg-white">
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
              placeholder="Search by name or city..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-36 text-xs h-9"
            >
              <option value="all">All Roles</option>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36 text-xs h-9"
            >
              <option value="all">All States</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Registered Profiles</CardTitle>
            <CardDescription>
              Showing {displayedUsers.length} of {meta.total} records (Page {meta.page} of {meta.totalPages || 1})
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Registered</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                      <span>Loading user records from server...</span>
                    </div>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No users match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Info */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 truncate">
                              {user.name}
                            </span>
                            {user.isVerifiedSeller && (
                              <span title="Verified Seller">
                                <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          user.role === "ADMIN"
                            ? "purple"
                            : user.role === "MODERATOR"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3">
                      <span className="text-slate-900">{user.locationCity || "India"}</span>
                      {user.locationState && (
                        <span className="text-[11px] text-slate-400 block">{user.locationState}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      {user.isActive === false ? (
                        <Badge variant="destructive">Inactive</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(user.createdAt, "dd MMM yyyy")}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setSelectedUser(user)}
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          variant={user.isActive === false ? "success" : "destructive"}
                          className="h-8 text-xs"
                          onClick={() =>
                            setModerationDialog({
                              open: true,
                              user,
                              action: "toggle_status",
                              targetStatus: user.isActive === false ? true : false,
                              reason: "",
                            })
                          }
                        >
                          {user.isActive === false ? "Activate" : "Deactivate"}
                        </Button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogHeader onClose={() => setSelectedUser(null)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {selectedUser.name}
                  {selectedUser.isVerifiedSeller && (
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  UUID: {selectedUser.id} • Registered {formatDate(selectedUser.createdAt, "dd MMM yyyy")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block">Current Role</span>
                <span className="font-bold text-slate-900">{selectedUser.role}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block">Account Status</span>
                <span className={`font-bold ${selectedUser.isActive === false ? "text-rose-600" : "text-emerald-600"}`}>
                  {selectedUser.isActive === false ? "Inactive" : "Active"}
                </span>
              </div>
            </div>

            {selectedUser.bio && (
              <div className="p-2.5 bg-slate-50 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block">Profile Bio</span>
                <p className="text-slate-700 mt-0.5">{selectedUser.bio}</p>
              </div>
            )}

            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>Location: {selectedUser.locationCity || "Not specified"}{selectedUser.locationState ? `, ${selectedUser.locationState}` : ""}</span>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap justify-between items-center gap-2 w-full">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setModerationDialog({
                    open: true,
                    user: selectedUser,
                    action: "change_role",
                    targetRole: selectedUser.role === "ADMIN" ? "USER" : "ADMIN",
                    reason: "",
                  })
                }
              >
                Change Role ({selectedUser.role === "ADMIN" ? "Demote to USER" : "Promote to ADMIN"})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  setModerationDialog({
                    open: true,
                    user: selectedUser,
                    action: "delete",
                    reason: "",
                  })
                }
              >
                Soft Delete Account
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Moderation Action Dialog */}
      {moderationDialog.open && (
        <Dialog
          open={moderationDialog.open}
          onOpenChange={(open) => setModerationDialog((prev) => ({ ...prev, open }))}
        >
          <DialogHeader onClose={() => setModerationDialog((prev) => ({ ...prev, open: false }))}>
            <DialogTitle>
              {moderationDialog.action === "change_role"
                ? "Update Staff Role"
                : moderationDialog.action === "toggle_status"
                ? `${moderationDialog.targetStatus ? "Activate" : "Deactivate"} User Account`
                : "Soft Delete User Account"}
            </DialogTitle>
            <DialogDescription>
              Target user: {moderationDialog.user?.name} ({moderationDialog.user?.id})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3 text-xs">
            {moderationDialog.action === "change_role" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select New Role
                </label>
                <Select
                  value={moderationDialog.targetRole || "USER"}
                  onChange={(e) =>
                    setModerationDialog((prev) => ({
                      ...prev,
                      targetRole: e.target.value as "USER" | "ADMIN" | "MODERATOR",
                    }))
                  }
                  className="h-9 text-xs"
                >
                  <option value="USER">USER (Regular Marketplace Account)</option>
                  <option value="MODERATOR">MODERATOR (Can moderate content & reports)</option>
                  <option value="ADMIN">ADMIN (Full administrative privileges)</option>
                </Select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reason (Logged to Immutable Audit Trail)
              </label>
              <Input
                placeholder="e.g. Promoted to operations staff / Deactivated per policy"
                value={moderationDialog.reason}
                onChange={(e) => setModerationDialog((prev) => ({ ...prev, reason: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => setModerationDialog((prev) => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={moderationDialog.action === "delete" ? "destructive" : "default"}
              size="sm"
              disabled={submitting}
              onClick={handleExecuteModeration}
            >
              {submitting ? "Processing..." : "Confirm Action"}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}
