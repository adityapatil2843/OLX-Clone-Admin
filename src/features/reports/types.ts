export type AdminReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED";

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
