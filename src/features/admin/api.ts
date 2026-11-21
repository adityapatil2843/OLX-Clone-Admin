import { usersApi } from "@/features/users/api";
import { listingsApi } from "@/features/listings/api";
import { reelsApi } from "@/features/reels/api";
import { categoriesApi } from "@/features/categories/api";
import { reportsApi } from "@/features/reports/api";
import { auditLogsApi } from "@/features/audit-logs/api";
import { metricsApi } from "@/features/metrics/api";

export { usersApi } from "@/features/users/api";
export { listingsApi } from "@/features/listings/api";
export { reelsApi } from "@/features/reels/api";
export { categoriesApi } from "@/features/categories/api";
export { reportsApi } from "@/features/reports/api";
export { auditLogsApi } from "@/features/audit-logs/api";
export { metricsApi } from "@/features/metrics/api";
export { apiClient, ApiClientError } from "@/lib/api-client";
export type { ApiResponseEnvelope } from "@/lib/api-client";

// Unified adminApi for backwards compatibility with existing screens
export const adminApi = {
  getMetrics: metricsApi.get,
  listUsers: usersApi.list,
  getUser: usersApi.getById,
  moderateUser: usersApi.moderate,
  deleteUser: usersApi.delete,
  listListings: listingsApi.list,
  getListing: listingsApi.getById,
  moderateListing: listingsApi.moderate,
  listReels: reelsApi.list,
  getReel: reelsApi.getById,
  moderateReel: reelsApi.moderate,
  listCategories: categoriesApi.list,
  createCategory: categoriesApi.create,
  updateCategory: categoriesApi.update,
  deleteCategory: categoriesApi.delete,
  listReports: reportsApi.list,
  resolveReport: reportsApi.resolve,
  listAuditLogs: auditLogsApi.list,
};
