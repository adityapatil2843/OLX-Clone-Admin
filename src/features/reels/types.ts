import type { ServerListing } from "@/features/listings/types";

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

export type ModerateReelStatus = "PUBLISHED" | "DRAFT" | "MODERATED" | "ARCHIVED";

export interface ListReelsParams {
  categoryId?: string;
  page?: number;
  limit?: number;
}
