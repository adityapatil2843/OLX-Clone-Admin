import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient, setAdminToken, clearAdminToken } from "@/lib/api-client";
import { parseJwt } from "@/components/layout/admin-role-guard";
import {
  createTestJwt,
  mockAdminMetrics,
  mockReportsList,
  mockAuditLogsList,
} from "../fixtures/mock-server";

describe("E2E Integration & Critical Admin User Journeys", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearAdminToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearAdminToken();
  });

  it("1. Admin Session Flow: authenticates with credentials, obtains token, stores in localStorage and decodes claims", async () => {
    const adminToken = createTestJwt({
      sub: "admin-uuid-001",
      role: "ADMIN",
      email: "ops-lead@bharatbazaar.in",
      exp: Math.floor(Date.now() / 1000) + 7200,
    });

    // Mock POST /auth/login
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/auth/login") && init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              user: { id: "admin-uuid-001", role: "ADMIN", email: "ops-lead@bharatbazaar.in" },
              tokens: { accessToken: adminToken, expiresIn: "2h" },
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const loginRes = await apiClient.post<{ tokens: { accessToken: string } }>(
      "/auth/login",
      { email: "ops-lead@bharatbazaar.in", password: "test-password-mock" },
      { skipAuth: true }
    );

    expect(loginRes.tokens.accessToken).toBe(adminToken);
    setAdminToken(loginRes.tokens.accessToken);

    const decoded = parseJwt(adminToken);
    expect(decoded?.role).toBe("ADMIN");
    expect(decoded?.email).toBe("ops-lead@bharatbazaar.in");
    expect(decoded?.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("2. Metrics Flow: queries GET /admin/metrics and receives operational counters", async () => {
    setAdminToken(createTestJwt({ role: "ADMIN" }));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockAdminMetrics }),
    });

    const metrics = await apiClient.get<typeof mockAdminMetrics>("/admin/metrics");
    expect(metrics.users.total).toBe(1860);
    expect(metrics.listings.active).toBe(890);
    expect(metrics.reels.published).toBe(512);
    expect(metrics.reports.pending).toBe(7);
  });

  it("3. Reports Queue Flow: lists pending reports, inspects payload, and marks report RESOLVED", async () => {
    setAdminToken(createTestJwt({ role: "MODERATOR" }));

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/admin/reports") && (!init?.method || init.method === "GET")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: mockReportsList,
            meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
          }),
        });
      }
      if (url.includes("/admin/reports/f47ac10b-58cc-4372-a567-0e02b2c3d479") && init?.method === "PATCH") {
        const body = JSON.parse((init.body as string) || "{}");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              ...mockReportsList[0],
              status: body.status,
              resolutionNotes: body.resolutionNotes,
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled route: ${url}`));
    });

    // List reports
    const reportsRes = await apiClient.getWithMeta<typeof mockReportsList>("/admin/reports?page=1&limit=20");
    expect(reportsRes.data.length).toBe(2);
    expect(reportsRes.data[0].status).toBe("PENDING");

    // Resolve report
    const updatedReport = await apiClient.patch(
      `/admin/reports/${reportsRes.data[0].id}`,
      {
        status: "RESOLVED",
        resolutionNotes: "Counterfeit product seller banned from marketplace.",
      }
    );
    expect(updatedReport).toMatchObject({
      status: "RESOLVED",
      resolutionNotes: "Counterfeit product seller banned from marketplace.",
    });
  });

  it("4. Listing Moderation Flow: updates listing status to ARCHIVED with moderation reason", async () => {
    setAdminToken(createTestJwt({ role: "MODERATOR" }));

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/admin/listings/listing-101/moderate") && init?.method === "PATCH") {
        const body = JSON.parse((init.body as string) || "{}");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              id: "listing-101",
              status: body.status,
              moderationReason: body.reason,
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled route: ${url}`));
    });

    const result = await apiClient.patch("/admin/listings/listing-101/moderate", {
      status: "ARCHIVED",
      reason: "Prohibited item policy violation",
    });

    expect(result).toEqual({
      id: "listing-101",
      status: "ARCHIVED",
      moderationReason: "Prohibited item policy violation",
    });
  });

  it("5. Reel Moderation Flow: updates reel status to MODERATED conforming to backend schema", async () => {
    setAdminToken(createTestJwt({ role: "MODERATOR" }));

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/admin/reels/reel-202/moderate") && init?.method === "PATCH") {
        const body = JSON.parse((init.body as string) || "{}");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              id: "reel-202",
              visibilityState: body.status,
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled: ${url}`));
    });

    const result = await apiClient.patch("/admin/reels/reel-202/moderate", {
      status: "MODERATED",
      reason: "Flagged for safety review by AI moderation",
    });

    expect(result).toEqual({
      id: "reel-202",
      visibilityState: "MODERATED",
    });
  });

  it("6. Admin-Only User Moderation Flow: updates staff role and deactivates account as ADMIN", async () => {
    setAdminToken(createTestJwt({ role: "ADMIN" }));

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/admin/users/user-555/moderate") && init?.method === "PATCH") {
        const body = JSON.parse((init.body as string) || "{}");
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              id: "user-555",
              role: body.role || "USER",
              isActive: body.isActive !== undefined ? body.isActive : true,
            },
          }),
        });
      }
      return Promise.reject(new Error(`Unhandled: ${url}`));
    });

    const result = await apiClient.patch("/admin/users/user-555/moderate", {
      role: "MODERATOR",
      isActive: true,
      reason: "Promoted to regional content moderator",
    });

    expect(result).toEqual({
      id: "user-555",
      role: "MODERATOR",
      isActive: true,
    });
  });

  it("7. Audit Log Access Flow: allows ADMIN and rejects MODERATOR with 403 Forbidden", async () => {
    // MODERATOR attempt -> 403
    setAdminToken(createTestJwt({ role: "MODERATOR" }));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { message: "ADMIN role required to inspect audit logs" },
      }),
    });

    await expect(apiClient.getWithMeta("/admin/audit-logs?page=1&limit=20")).rejects.toThrow(
      "ADMIN role required"
    );

    // ADMIN attempt -> 200 OK
    setAdminToken(createTestJwt({ role: "ADMIN" }));
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockAuditLogsList,
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });

    const logsRes = await apiClient.getWithMeta<typeof mockAuditLogsList>("/admin/audit-logs?page=1&limit=20");
    expect(logsRes.data.length).toBe(1);
    expect(logsRes.data[0].action).toBe("MODERATE_LISTING");
  });

  it("8. Expired/Invalid Session Behavior: automatically purges token on 401 response", async () => {
    setAdminToken(createTestJwt({ role: "ADMIN" }));
    expect(window.localStorage.getItem("admin_access_token")).not.toBeNull();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: "JWT access token has expired",
      }),
    });

    await expect(apiClient.get("/admin/metrics")).rejects.toThrow("JWT access token has expired");
    expect(window.localStorage.getItem("admin_access_token")).toBeNull();
  });
});
