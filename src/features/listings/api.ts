import { apiClient, ApiResponseEnvelope } from "@/lib/api-client";
import type { ServerListing, ListListingsParams } from "./types";

export const listingsApi = {
  list: (params?: ListListingsParams): Promise<ApiResponseEnvelope<ServerListing[]>> => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiClient.getWithMeta<ServerListing[]>(`/listings${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string): Promise<ServerListing> => {
    return apiClient.get<ServerListing>(`/listings/${id}`);
  },

  moderate: (
    id: string,
    status: "ACTIVE" | "DRAFT" | "SOLD" | "ARCHIVED",
    reason?: string
  ): Promise<ServerListing> => {
    return apiClient.patch<ServerListing>(`/admin/listings/${id}/moderate`, {
      status,
      reason,
    });
  },
};
