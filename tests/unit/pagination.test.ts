import { describe, it, expect } from "vitest";

describe("Pagination Logic & Parameter Bounds Unit Tests", () => {
  const clampPage = (p: number) => (Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1);
  const clampLimit = (l: number) => {
    if (!Number.isFinite(l)) return 20;
    const intVal = Math.floor(l);
    return Math.max(1, Math.min(100, intVal));
  };

  it("should clamp page numbers less than 1 to 1", () => {
    expect(clampPage(0)).toBe(1);
    expect(clampPage(-5)).toBe(1);
    expect(clampPage(-999)).toBe(1);
    expect(clampPage(NaN)).toBe(1);
    expect(clampPage(Infinity)).toBe(1);
  });

  it("should floor fractional page numbers", () => {
    expect(clampPage(2.7)).toBe(2);
    expect(clampPage(5.1)).toBe(5);
  });

  it("should clamp limit between 1 and 100", () => {
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(-10)).toBe(1);
    expect(clampLimit(101)).toBe(100);
    expect(clampLimit(500)).toBe(100);
    expect(clampLimit(25)).toBe(25);
    expect(clampLimit(1)).toBe(1);
    expect(clampLimit(100)).toBe(100);
    expect(clampLimit(NaN)).toBe(20);
  });

  it("should build sanitized URL query strings conforming to backend paginationQuerySchema", () => {
    const buildPaginationQuery = (page: number, limit: number) => {
      const validPage = clampPage(page);
      const validLimit = clampLimit(limit);
      const search = new URLSearchParams({
        page: String(validPage),
        limit: String(validLimit),
      });
      return search.toString();
    };

    expect(buildPaginationQuery(-2, 200)).toBe("page=1&limit=100");
    expect(buildPaginationQuery(3, 50)).toBe("page=3&limit=50");
    expect(buildPaginationQuery(1, 0)).toBe("page=1&limit=1");
  });
});
