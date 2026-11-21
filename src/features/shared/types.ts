export interface AdminPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}
