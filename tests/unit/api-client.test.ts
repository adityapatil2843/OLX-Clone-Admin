import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiClient,
  ApiClientError,
  setAdminToken,
  clearAdminToken,
  getAdminToken,
  getAdminBaseUrl,
} from "@/lib/api-client";

describe("API Client Unit Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearAdminToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    clearAdminToken();
  });

  it("should parse successful JSON response with envelope", async () => {
    const mockData = { id: "123", name: "Test Entity" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData }),
    });

    const result = await apiClient.get<typeof mockData>("/test-endpoint");
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test-endpoint"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("should parse getWithMeta response including pagination meta", async () => {
    const mockItems = [{ id: "1" }, { id: "2" }];
    const mockMeta = { page: 1, limit: 20, total: 2, totalPages: 1 };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockItems, meta: mockMeta }),
    });

    const result = await apiClient.getWithMeta<typeof mockItems>("/items");
    expect(result.data).toEqual(mockItems);
    expect(result.meta).toEqual(mockMeta);
  });

  it("should include Bearer token in headers when token is set", async () => {
    setAdminToken("test.jwt.token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: "ok" }),
    });

    await apiClient.get("/protected");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test.jwt.token",
        }),
      })
    );
  });

  it("should omit token if skipAuth is enabled", async () => {
    setAdminToken("test.jwt.token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: "ok" }),
    });

    await apiClient.get("/public", { skipAuth: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
  });

  it("should throw ApiClientError on 404 with server message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: { message: "Listing not found", code: "NOT_FOUND" },
      }),
    });

    await expect(apiClient.get("/listings/non-existent")).rejects.toThrow(
      "Listing not found"
    );
  });

  it("should throw ApiClientError on 403 Forbidden", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { message: "ADMIN role required for this operation" },
      }),
    });

    await expect(apiClient.patch("/admin/users/1/moderate", {})).rejects.toThrow(
      "ADMIN role required"
    );
  });

  it("should throw ApiClientError with status 422 on validation error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        message: "Invalid status value",
      }),
    });

    try {
      await apiClient.patch("/admin/reels/1/moderate", { status: "INVALID_STATUS" });
      expect.unreachable();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(422);
      expect((err as ApiClientError).message).toBe("Invalid status value");
    }
  });

  it("should handle 429 Too Many Requests rate limit", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        success: false,
        message: "Too many requests. Please slow down.",
      }),
    });

    await expect(apiClient.get("/rate-limited")).rejects.toThrow(
      "Too many requests"
    );
  });

  it("should handle 500 Internal Server Error gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: "Internal server error occurred",
      }),
    });

    await expect(apiClient.get("/server-crash")).rejects.toThrow(
      "Internal server error"
    );
  });

  it("should clear token and dispatch admin:unauthorized on 401 response", async () => {
    setAdminToken("valid.format.token");
    expect(getAdminToken()).toBe("valid.format.token");

    const unauthorizedListener = vi.fn();
    window.addEventListener("admin:unauthorized", unauthorizedListener);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: "Token expired or invalid",
      }),
    });

    await expect(apiClient.get("/admin/metrics")).rejects.toThrow();

    expect(getAdminToken()).toBeNull();
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    window.removeEventListener("admin:unauthorized", unauthorizedListener);
  });

  it("should handle timeout by mapping AbortError to 408", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const abortErr = new DOMException("The user aborted a request.", "AbortError");
      return Promise.reject(abortErr);
    });

    try {
      await apiClient.get("/slow-endpoint", { timeoutMs: 50 });
      expect.unreachable();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(408);
      expect((err as ApiClientError).message).toContain("timeout");
    }
  });

  it("should handle network failure / offline state with status 0", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    try {
      await apiClient.get("/offline");
      expect.unreachable();
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(0);
      expect((err as ApiClientError).message).toContain("Failed to fetch");
    }
  });

  it("should construct valid admin base URL without trailing slash", () => {
    const url = getAdminBaseUrl();
    expect(url).not.toMatch(/\/$/);
    expect(url).toMatch(/^https?:\/\//);
  });
});
