export type AdminReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

export interface AdminMetrics {
  users: { active: number; total: number };
  reels: { published: number; total: number };
  listings: { active: number; sold: number; total: number };
  advertisements: { active: number; total: number };
  reports: { pending: number };
  retrievedAt: string;
}

export interface AdminPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
}

export interface ServerUser {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  locationState?: string | null;
  locationCity?: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  isVerifiedSeller: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

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

export interface ServerReel {
  id: string;
  caption?: string | null;
  hashtags?: string[];
  categoryId?: string | null;
  locationText?: string | null;
  visibilityState: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "MODERATED";
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
  };
  mediaAsset?: {
    id: string;
    storageKey: string;
    thumbnailKey?: string | null;
    durationMs?: number | null;
    mimeType?: string | null;
    processingState?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  taggedProducts?: Array<{
    id: string;
    listing?: ServerListing;
  }>;
}

export interface ServerCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  parent?: ServerCategory | null;
  children?: ServerCategory[];
  attributes?: unknown;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminReport {
  id: string;
  reporterId: string;
  targetType: "USER" | "LISTING" | "REEL";
  targetId: string;
  reason: string;
  details?: string | null;
  status: AdminReportStatus;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: { id: string; name: string; email?: string | null };
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  admin?: { id: string; name: string; email?: string | null; role: string };
}
