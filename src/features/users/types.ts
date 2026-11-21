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

export interface ModerateUserPayload {
  isActive?: boolean;
  role?: "USER" | "ADMIN" | "MODERATOR";
  reason?: string;
}

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}
