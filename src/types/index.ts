export type Role = "buyer" | "seller" | "business" | "admin" | "moderator";

export type UserStatus = "active" | "suspended" | "pending_verification" | "banned";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: Role;
  status: UserStatus;
  isVerified: boolean;
  city: string;
  state: string;
  createdAt: string;
  totalListings: number;
  totalReels: number;
  trustScore: number; // 0 - 100
  lastActive: string;
}

export type ListingStatus = "active" | "under_review" | "sold" | "flagged" | "rejected";

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar: string;
  location: {
    city: string;
    state: string;
    locality: string;
  };
  thumbnail: string;
  images: string[];
  hasReel: boolean;
  reelId?: string;
  status: ListingStatus;
  viewsCount: number;
  inquiriesCount: number;
  isFeatured: boolean;
  condition: "New" | "Like New" | "Good" | "Fair";
  createdAt: string;
  flagReason?: string;
  attributes: Record<string, string | number | boolean>;
}

export type ReelStatus = "published" | "under_review" | "flagged" | "removed" | "age_restricted";

export interface Reel {
  id: string;
  title: string;
  caption: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorRole: Role;
  thumbnail: string;
  videoUrl: string;
  durationSeconds: number;
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  reportsCount: number;
  status: ReelStatus;
  createdAt: string;
  taggedListing?: {
    id: string;
    title: string;
    price: number;
    category: string;
  };
  audioTrack: string;
  moderationScore: number; // 0-100, AI safety score
  violations?: string[];
}

export type ReportTargetType = "user" | "listing" | "reel";
export type ReportStatus = "pending" | "resolved" | "dismissed" | "investigating";
export type ReportSeverity = "low" | "medium" | "high" | "critical";

export interface Report {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
  targetThumbnail?: string;
  reason: string;
  details: string;
  severity: ReportSeverity;
  status: ReportStatus;
  reportedBy: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  reportedEntityOwner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  assignedAdmin?: string;
  actionTaken?: string;
}

export interface CategoryAttribute {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "boolean";
  required: boolean;
  options?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  listingCount: number;
  attributes: CategoryAttribute[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  listingCount: number;
  reelsCount: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

export type BusinessTier = "Silver" | "Gold" | "Diamond";
export type VerificationStatus = "pending" | "approved" | "rejected" | "suspended";

export interface BusinessAccount {
  id: string;
  companyName: string;
  brandName: string;
  gstin: string;
  panNumber: string;
  tradeCategory: string;
  tier: BusinessTier;
  verificationStatus: VerificationStatus;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  avatar: string;
  city: string;
  state: string;
  address: string;
  rating: number;
  totalListings: number;
  monthlyGmv: number; // in INR
  joinedDate: string;
  badgeVerified: boolean;
  documents: {
    gstCertificateUrl: string;
    tradeLicenseUrl: string;
  };
}

export interface VerificationRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantType: "individual" | "business";
  idType: "Aadhaar Card" | "PAN Card" | "GST Certificate" | "Voter ID" | "Passport";
  idNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  confidenceScore: number; // AI verification match score (0-100%)
}

export interface NotificationCampaign {
  id: string;
  title: string;
  body: string;
  audience: "all" | "sellers_only" | "buyers_only" | "business_accounts" | "tier1_cities";
  channel: "push" | "in_app" | "both";
  deepLink?: string;
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledFor?: string;
  sentAt?: string;
  recipientsCount: number;
  openRate: number; // percentage
  clickRate: number; // percentage
  createdAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  campaignType: "sponsored_reel" | "featured_listing" | "banner_top" | "category_takeover";
  advertiserName: string;
  advertiserId: string;
  thumbnail: string;
  targetUrl: string;
  budgetDaily: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate %
  status: "active" | "paused" | "completed" | "pending_approval";
  startDate: string;
  endDate: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  entityType: "user" | "listing" | "reel" | "report" | "category" | "verification" | "settings" | "ad";
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "warning" | "failed";
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  department: string;
  twoFactorEnabled: boolean;
  lastLogin: string;
}

export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  maxReelDurationSeconds: number;
  maxReelUploadMb: number;
  aiAutoModerationSensitivity: "low" | "medium" | "strict";
  autoApproveVerifiedSellers: boolean;
  maintenanceMode: boolean;
  newRegistrationsAllowed: boolean;
  maxFreeListingsPerUser: number;
  sponsoredAdPricePerDay: number;
}
