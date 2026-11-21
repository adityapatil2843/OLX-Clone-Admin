import { apiClient } from "@/lib/api-client";
import type { ServerCategory, CreateCategoryPayload, UpdateCategoryPayload } from "./types";

export const categoriesApi = {
  list: (includeInactive = true): Promise<ServerCategory[]> => {
    return apiClient.get<ServerCategory[]>(`/categories?includeInactive=${includeInactive}`);
  },

  create: (payload: CreateCategoryPayload): Promise<ServerCategory> => {
    return apiClient.post<ServerCategory>("/categories", payload);
  },

  update: (id: string, payload: UpdateCategoryPayload): Promise<ServerCategory> => {
    return apiClient.patch<ServerCategory>(`/categories/${id}`, payload);
  },

  delete: (id: string): Promise<{ message?: string }> => {
    return apiClient.delete<{ message?: string }>(`/categories/${id}`);
  },
};
