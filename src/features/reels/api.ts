import { apiClient, ApiResponseEnvelope } from "@/lib/api-client";
import type { ServerReel, ListReelsParams, ModerateReelStatus } from "./types";

export const reelsApi = {
  list: (params?: ListReelsParams): Promise<ApiResponseEnvelope<ServerReel[]>> => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiClient.getWithMeta<ServerReel[]>(`/reels${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string): Promise<ServerReel> => {
    return apiClient.get<ServerReel>(`/reels/${id}`);
  },

  moderate: (
    id: string,
    status: ModerateReelStatus,
    reason?: string
  ): Promise<ServerReel> => {
    return apiClient.patch<ServerReel>(`/admin/reels/${id}/moderate`, {
      status,
      reason,
    });
  },
};
