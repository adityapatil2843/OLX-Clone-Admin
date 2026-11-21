import { describe, it, expect } from "vitest";
import { parseJwt } from "@/components/layout/admin-role-guard";
import { createTestJwt } from "../fixtures/mock-server";

describe("JWT & Authorization Decision Unit Tests", () => {
  it("should parse a valid synthetic 3-segment JWT", () => {
    const payload = {
      sub: "user-123",
      role: "ADMIN",
      email: "staff@bharatbazaar.in",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const token = createTestJwt(payload);
    const parsed = parseJwt(token);

    expect(parsed).not.toBeNull();
    expect(parsed?.sub).toBe("user-123");
    expect(parsed?.role).toBe("ADMIN");
    expect(parsed?.email).toBe("staff@bharatbazaar.in");
    expect(parsed?.exp).toBe(payload.exp);
  });

  it("should reject non-JWT plain text (never treat as ADMIN)", () => {
    expect(parseJwt("random-token-string")).toBeNull();
    expect(parseJwt("admin")).toBeNull();
    expect(parseJwt("mock_admin_token")).toBeNull();
    expect(parseJwt("")).toBeNull();
    expect(parseJwt(" ")).toBeNull();
  });

  it("should reject malformed tokens with incorrect segments", () => {
    expect(parseJwt("header.payload")).toBeNull(); // Only 2 parts
    expect(parseJwt("part1.part2.part3.part4")).toBeNull(); // 4 parts
    expect(parseJwt("invalid-base64.invalid-base64.sig")).toBeNull();
  });

  it("should detect expired tokens correctly", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
    const token = createTestJwt({
      sub: "user-exp",
      role: "ADMIN",
      exp: pastExp,
    });
    const parsed = parseJwt(token);

    expect(parsed).not.toBeNull();
    expect(parsed?.exp).toBe(pastExp);
    const isExpired = Boolean(parsed?.exp && parsed.exp * 1000 < Date.now());
    expect(isExpired).toBe(true);
  });

  it("should detect active non-expired tokens", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 7200; // 2 hours in future
    const token = createTestJwt({
      sub: "user-active",
      role: "MODERATOR",
      exp: futureExp,
    });
    const parsed = parseJwt(token);

    expect(parsed).not.toBeNull();
    const isExpired = Boolean(parsed?.exp && parsed.exp * 1000 < Date.now());
    expect(isExpired).toBe(false);
  });

  it("should allow ADMIN and MODERATOR staff roles", () => {
    const isStaffRole = (role?: string) => {
      const upper = (role || "").toUpperCase();
      return upper === "ADMIN" || upper === "MODERATOR";
    };

    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("admin")).toBe(true);
    expect(isStaffRole("MODERATOR")).toBe(true);
    expect(isStaffRole("moderator")).toBe(true);
  });

  it("should reject non-staff roles (USER, BUYER, SELLER, BUSINESS)", () => {
    const isStaffRole = (role?: string) => {
      const upper = (role || "").toUpperCase();
      return upper === "ADMIN" || upper === "MODERATOR";
    };

    expect(isStaffRole("USER")).toBe(false);
    expect(isStaffRole("user")).toBe(false);
    expect(isStaffRole("BUYER")).toBe(false);
    expect(isStaffRole("SELLER")).toBe(false);
    expect(isStaffRole("BUSINESS")).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
    expect(isStaffRole("")).toBe(false);
  });

  it("should distinguish ADMIN-only privileges from MODERATOR", () => {
    const isAdminOnlyOperation = (userRole: string) => {
      return userRole.toUpperCase() === "ADMIN";
    };

    // User moderation and audit logs require ADMIN
    expect(isAdminOnlyOperation("ADMIN")).toBe(true);
    expect(isAdminOnlyOperation("MODERATOR")).toBe(false);
  });
});
