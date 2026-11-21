import { apiClient, ApiResponseEnvelope } from "@/lib/api-client";
import type { ServerUser, ModerateUserPayload, ListUsersParams } from "./types";

export const usersApi = {
  list: (params?: ListUsersParams): Promise<ApiResponseEnvelope<ServerUser[]>> => {
    const query = new URLSearchParams();
    if (params?.search?.trim()) query.set("search", params.search.trim());
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return apiClient.getWithMeta<ServerUser[]>(`/users${qs ? `?${qs}` : ""}`);
  },

  getById: (id: string): Promise<ServerUser> => {
    return apiClient.get<ServerUser>(`/users/${id}`);
  },

  moderate: (id: string, payload: ModerateUserPayload): Promise<ServerUser> => {
    return apiClient.patch<ServerUser>(`/admin/users/${id}/moderate`, payload);
  },

  delete: (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },
};
