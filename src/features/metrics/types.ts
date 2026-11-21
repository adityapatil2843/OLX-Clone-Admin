export interface AdminMetrics {
  users: { active: number; total: number };
  reels: { published: number; total: number };
  listings: { active: number; sold: number; total: number };
  advertisements: { active: number; total: number };
  reports: { pending: number };
  retrievedAt: string;
}
