export * from "./users";
export * from "./listings";
export * from "./reels";
export * from "./reports";
export * from "./categories";
export * from "./businesses";
export * from "./verifications";
export * from "./notifications";
export * from "./ads";
export * from "./audit-logs";
export * from "./analytics";

import { initialUsers } from "./users";
import { initialListings } from "./listings";
import { initialReels } from "./reels";
import { initialReports } from "./reports";
import { initialCategories } from "./categories";
import { initialBusinesses } from "./businesses";
import { initialVerifications } from "./verifications";
import { initialCampaigns } from "./notifications";
import { initialAds } from "./ads";
import { initialAuditLogs } from "./audit-logs";

export const getDashboardKPIs = () => {
  return {
    totalUsers: { value: 186420, change: "+14.8%", isPositive: true, label: "vs last month" },
    activeListings: { value: 19680, change: "+8.2%", isPositive: true, label: "vs last month" },
    publishedReels: { value: 34290, change: "+24.5%", isPositive: true, label: "vs last month" },
    pendingReports: { value: 18, change: "-12.5%", isPositive: true, label: "needs action" },
    verifiedBusinesses: { value: 1240, change: "+19.2%", isPositive: true, label: "active GST sellers" },
    engagementRate: { value: "8.6%", change: "+1.4%", isPositive: true, label: "views-to-inquiries" },
    dailyGmvEstimate: { value: 4850000, change: "+16.2%", isPositive: true, label: "₹ estimated volume" },
  };
};

export const getInitialData = () => ({
  users: initialUsers,
  listings: initialListings,
  reels: initialReels,
  reports: initialReports,
  categories: initialCategories,
  businesses: initialBusinesses,
  verifications: initialVerifications,
  notifications: initialCampaigns,
  ads: initialAds,
  auditLogs: initialAuditLogs,
});
