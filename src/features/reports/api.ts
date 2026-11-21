import { apiClient, ApiResponseEnvelope } from "@/lib/api-client";
import type { AdminReport, AdminReportStatus } from "./types";

export const reportsApi = {
  list: (page = 1, limit = 20, status?: string): Promise<ApiResponseEnvelope<AdminReport[]>> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status && status !== "all") query.set("status", status);
    return apiClient.getWithMeta<AdminReport[]>(`/admin/reports?${query.toString()}`);
  },

  resolve: (
    id: string,
    status: Exclude<AdminReportStatus, "PENDING">,
    resolutionNotes?: string
  ): Promise<AdminReport> => {
    return apiClient.patch<AdminReport>(`/admin/reports/${id}`, {
      status,
      resolutionNotes,
    });
  },
};
