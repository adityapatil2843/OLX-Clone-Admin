import type {
  AdminAuditLog,
  AdminMetrics,
  AdminPageMeta,
  AdminReport,
  AdminReportStatus,
  ServerCategory,
  ServerListing,
  ServerReel,
  ServerUser,
} from "./types";

const baseUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "https://olx-clone-server-zngq.onrender.com/api/v1").replace(/\/$/, "");

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: AdminPageMeta;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("admin_access_token") : null;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    meta?: AdminPageMeta;
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok || body.success === false) {
    const errorMsg = body.error?.message || body.message || `Admin API request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return body.data as T;
}

async function requestWithMeta<T>(path: string, init?: RequestInit): Promise<ApiResponseEnvelope<T>> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("admin_access_token") : null;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: T;
    meta?: AdminPageMeta;
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok || body.success === false) {
    const errorMsg = body.error?.message || body.message || `Admin API request failed (${response.status})`;
    throw new Error(errorMsg);
  }

  return {
    data: (body.data || []) as T,
    meta: body.meta || { page: 1, limit: 20, total: Array.isArray(body.data) ? body.data.length : 0, totalPages: 1 },
  };
}

export const adminApi = {
  // ── Metrics ──────────────────────────────────────────────────
  getMetrics: () => request<AdminMetrics>("/admin/metrics"),

  // ── Users Management ─────────────────────────────────────────
  listUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return requestWithMeta<ServerUser[]>(`/users${qs ? `?${qs}` : ""}`);
  },

  moderateUser: (
    id: string,
    payload: { isActive?: boolean; role?: "USER" | "ADMIN" | "MODERATOR"; reason?: string }
  ) =>
    request<ServerUser>(`/admin/users/${id}/moderate`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteUser: (id: string) =>
    request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),

  // ── Listings Moderation ──────────────────────────────────────
  listListings: (params?: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return requestWithMeta<ServerListing[]>(`/listings${qs ? `?${qs}` : ""}`);
  },

  getListing: (id: string) => request<ServerListing>(`/listings/${id}`),

  moderateListing: (
    id: string,
    status: "ACTIVE" | "DRAFT" | "SOLD" | "ARCHIVED",
    reason?: string
  ) =>
    request<ServerListing>(`/admin/listings/${id}/moderate`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }),

  // ── Reels Moderation ─────────────────────────────────────────
  listReels: (params?: { categoryId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return requestWithMeta<ServerReel[]>(`/reels${qs ? `?${qs}` : ""}`);
  },

  getReel: (id: string) => request<ServerReel>(`/reels/${id}`),

  moderateReel: (
    id: string,
    status: "PUBLISHED" | "DRAFT" | "PROCESSING" | "FAILED" | "ARCHIVED",
    reason?: string
  ) =>
    request<ServerReel>(`/admin/reels/${id}/moderate`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }),

  // ── Categories Taxonomy ──────────────────────────────────────
  listCategories: (includeInactive = true) =>
    request<ServerCategory[]>(`/categories?includeInactive=${includeInactive}`),

  createCategory: (payload: {
    name: string;
    slug?: string;
    description?: string;
    iconUrl?: string;
    parentId?: string | null;
    displayOrder?: number;
  }) =>
    request<ServerCategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateCategory: (
    id: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      iconUrl?: string;
      parentId?: string | null;
      displayOrder?: number;
      isActive?: boolean;
    }
  ) =>
    request<ServerCategory>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: string) =>
    request<{ message?: string }>(`/categories/${id}`, {
      method: "DELETE",
    }),

  // ── Reports Queue ────────────────────────────────────────────
  listReports: (page = 1, limit = 20, status?: string) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status && status !== "all") query.set("status", status);
    return requestWithMeta<AdminReport[]>(`/admin/reports?${query.toString()}`);
  },

  resolveReport: (
    id: string,
    status: Exclude<AdminReportStatus, "PENDING">,
    resolutionNotes?: string
  ) =>
    request<AdminReport>(`/admin/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, resolutionNotes }),
    }),

  // ── Audit Logs ───────────────────────────────────────────────
  listAuditLogs: (page = 1, limit = 20) =>
    requestWithMeta<AdminAuditLog[]>(`/admin/audit-logs?page=${page}&limit=${limit}`),
};
