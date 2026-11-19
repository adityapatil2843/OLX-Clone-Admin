import { AdminProfile, PlatformSettings } from "@/types";

export const defaultAdminProfile: AdminProfile = {
  name: "Priya Nair",
  email: "priya.nair@bharatbazaar.in",
  role: "Lead Administrator & Trust Officer",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  phone: "+91 98200 11445",
  department: "Trust & Safety Operations",
  twoFactorEnabled: true,
  lastLogin: "Today at 09:14 AM (Mumbai HQ)",
};

export const defaultPlatformSettings: PlatformSettings = {
  siteName: "BharatBazaar Video Marketplace",
  supportEmail: "admin-support@bharatbazaar.in",
  supportPhone: "1800-266-9900 (Toll Free)",
  currency: "INR (₹)",
  maxReelDurationSeconds: 60,
  maxReelUploadMb: 75,
  aiAutoModerationSensitivity: "strict",
  autoApproveVerifiedSellers: true,
  maintenanceMode: false,
  newRegistrationsAllowed: true,
  maxFreeListingsPerUser: 10,
  sponsoredAdPricePerDay: 499,
};

export const userGrowthData = [
  { month: "Nov 2023", activeUsers: 48000, newSignups: 9200, verifiedSellers: 3200 },
  { month: "Dec 2023", activeUsers: 64000, newSignups: 14100, verifiedSellers: 4800 },
  { month: "Jan 2024", activeUsers: 82000, newSignups: 19800, verifiedSellers: 6900 },
  { month: "Feb 2024", activeUsers: 108000, newSignups: 26500, verifiedSellers: 9400 },
  { month: "Mar 2024", activeUsers: 142000, newSignups: 34200, verifiedSellers: 13200 },
  { month: "Apr 2024", activeUsers: 186000, newSignups: 42800, verifiedSellers: 17800 },
];

export const reelEngagementData = [
  { day: "Mon", views: 240000, likes: 21000, shares: 4800, comments: 2400 },
  { day: "Tue", views: 290000, likes: 26500, shares: 5900, comments: 3100 },
  { day: "Wed", views: 340000, likes: 31200, shares: 7200, comments: 3800 },
  { day: "Thu", views: 395000, likes: 37400, shares: 8900, comments: 4600 },
  { day: "Fri", views: 480000, likes: 44800, shares: 11200, comments: 5900 },
  { day: "Sat", views: 620000, likes: 58900, shares: 15400, comments: 8400 },
  { day: "Sun", views: 740000, likes: 71200, shares: 19800, comments: 10500 },
];

export const categoryDistributionData = [
  { name: "Fashion & Handlooms", value: 32, count: 5680, color: "#8b5cf6" },
  { name: "Mobiles & Electronics", value: 24, count: 4210, color: "#3b82f6" },
  { name: "Vehicles & Auto", value: 18, count: 3120, color: "#10b981" },
  { name: "Home & Decor", value: 16, count: 2890, color: "#f59e0b" },
  { name: "Real Estate & Spaces", value: 10, count: 1840, color: "#ec4899" },
];

export const topCitiesData = [
  { city: "Mumbai", listings: 3450, reels: 8900, gmvLakhs: 480 },
  { city: "Bengaluru", listings: 3120, reels: 7450, gmvLakhs: 520 },
  { city: "Delhi NCR", listings: 2980, reels: 6890, gmvLakhs: 460 },
  { city: "Hyderabad", listings: 2240, reels: 5120, gmvLakhs: 340 },
  { city: "Pune", listings: 1890, reels: 4350, gmvLakhs: 280 },
  { city: "Ahmedabad", listings: 1620, reels: 3840, gmvLakhs: 240 },
  { city: "Kochi", listings: 1410, reels: 3290, gmvLakhs: 195 },
];

export const listingActivityWeekly = [
  { week: "W1", newListings: 1240, soldListings: 890, flaggedListings: 42 },
  { week: "W2", newListings: 1580, soldListings: 1120, flaggedListings: 38 },
  { week: "W3", newListings: 1920, soldListings: 1410, flaggedListings: 51 },
  { week: "W4", newListings: 2450, soldListings: 1830, flaggedListings: 29 },
];
