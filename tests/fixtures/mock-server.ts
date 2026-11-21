/**
 * Test Fixtures & Mock Utilities for Admin Testing.
 * Contains purely synthetic test data. NO REAL TOKENS OR SECRETS.
 */

export interface TestJwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

/**
 * Creates a synthetic, unsigned 3-segment JWT for unit & component tests.
 * Never use for production signing; valid for frontend decoding verification only.
 */
export function createTestJwt(payload: TestJwtPayload): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const headerEnc = encode(header);
  const payloadEnc = encode(payload);
  const signatureEnc = "fake_test_signature_mock_only";

  return `${headerEnc}.${payloadEnc}.${signatureEnc}`;
}

export const mockAdminMetrics = {
  users: { active: 1420, total: 1860 },
  reels: { published: 512, total: 640 },
  listings: { active: 890, sold: 340, total: 1230 },
  advertisements: { active: 18, total: 24 },
  reports: { pending: 7 },
  retrievedAt: "2026-11-21T10:00:00.000Z",
};

export const mockReportsList = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    reporterId: "user-101",
    targetType: "LISTING" as const,
    targetId: "listing-202",
    reason: "Suspected counterfeit electronics",
    details: "Seller refuses in-person inspection and insists on advance payment.",
    status: "PENDING" as const,
    resolutionNotes: null,
    createdAt: "2026-11-20T14:30:00.000Z",
    reporter: {
      id: "user-101",
      name: "Rohan Verma",
      email: "rohan.test@bharatbazaar.in",
    },
  },
  {
    id: "e12bc34d-56ef-7890-a123-456789abcdef",
    reporterId: "user-102",
    targetType: "REEL" as const,
    targetId: "reel-303",
    reason: "Dangerous stunt on public road",
    details: "Reel shows reckless driving without helmet.",
    status: "PENDING" as const,
    resolutionNotes: null,
    createdAt: "2026-11-21T08:15:00.000Z",
    reporter: {
      id: "user-102",
      name: "Pooja Sharma",
      email: "pooja.test@bharatbazaar.in",
    },
  },
];

export const mockAuditLogsList = [
  {
    id: "log-1",
    adminId: "admin-uuid-1",
    action: "MODERATE_LISTING",
    targetType: "LISTING",
    targetId: "listing-202",
    details: { previousStatus: "ACTIVE", newStatus: "ARCHIVED", reason: "Copyright violation" },
    createdAt: "2026-11-21T09:00:00.000Z",
    admin: {
      id: "admin-uuid-1",
      name: "Lead Admin",
      email: "admin@bharatbazaar.in",
      role: "ADMIN",
    },
  },
];
