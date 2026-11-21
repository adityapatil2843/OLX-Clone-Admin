import { apiClient } from "@/lib/api-client";
import type { AdminMetrics } from "./types";

export const metricsApi = {
  get: (): Promise<AdminMetrics> => {
    return apiClient.get<AdminMetrics>("/admin/metrics");
  },
};
