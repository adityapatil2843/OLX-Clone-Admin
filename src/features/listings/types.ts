export interface ServerListingMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  storageKey: string;
  thumbnailKey?: string | null;
  provider: string;
  displayOrder: number;
  url?: string;
}

export interface ServerListing {
  id: string;
  title: string;
  price: number | string;
  currency: string;
  description?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationLocality?: string | null;
  contactPhone: string;
  status: "ACTIVE" | "DRAFT" | "SOLD" | "ARCHIVED";
  attributes?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  categoryId: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isVerifiedSeller?: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    attributes?: unknown;
  };
  media?: ServerListingMedia[];
}

export interface ListListingsParams {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}
