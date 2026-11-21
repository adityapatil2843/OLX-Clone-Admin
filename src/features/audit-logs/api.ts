import { apiClient, ApiResponseEnvelope } from "@/lib/api-client";
import type { AdminAuditLog } from "./types";

export const auditLogsApi = {
  list: (page = 1, limit = 20): Promise<ApiResponseEnvelope<AdminAuditLog[]>> => {
    return apiClient.getWithMeta<AdminAuditLog[]>(`/admin/audit-logs?page=${page}&limit=${limit}`);
  },
};
