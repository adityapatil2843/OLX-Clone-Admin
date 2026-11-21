import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AdminRoleGuard } from "@/components/layout/admin-role-guard";
import { createTestJwt } from "../fixtures/mock-server";

// Mock sonner toast to verify alerts
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe("AdminRoleGuard Component Tests", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("should show Staff Authentication Required view when unauthenticated", async () => {
    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    expect(screen.getByText("Staff Authentication Required")).toBeInTheDocument();
    expect(screen.getByText("Staff Login (Backend)")).toBeInTheDocument();
    expect(screen.getByText("Manual Token (Dev)")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should REJECT invalid/non-JWT strings and NOT treat them as ADMIN (Security Fix)", async () => {
    window.localStorage.setItem("admin_access_token", "invalid-non-jwt-string");

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    // Content should NOT be rendered
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    // Storage must be purged of invalid token
    expect(window.localStorage.getItem("admin_access_token")).toBeNull();
    // Error message should be visible
    expect(
      screen.getByText(/Invalid token format/i)
    ).toBeInTheDocument();
  });

  it("should REJECT expired tokens and display session expired message", async () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 1800; // 30 min ago
    const expiredToken = createTestJwt({
      sub: "expired-user",
      role: "ADMIN",
      exp: expiredExp,
    });
    window.localStorage.setItem("admin_access_token", expiredToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("admin_access_token")).toBeNull();
    expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
  });

  it("should REJECT non-staff USER tokens and deny access", async () => {
    const userToken = createTestJwt({
      sub: "normal-user",
      role: "USER",
      email: "buyer@example.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem("admin_access_token", userToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it("should ALLOW valid ADMIN token and render protected child content with ADMIN badge", async () => {
    const adminToken = createTestJwt({
      sub: "admin-uuid",
      role: "ADMIN",
      email: "admin@bharatbazaar.in",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem("admin_access_token", adminToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText(/Authenticated Staff Session:/i)).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("(admin@bharatbazaar.in)")).toBeInTheDocument();
  });

  it("should ALLOW valid MODERATOR token and render protected content with MODERATOR badge", async () => {
    const modToken = createTestJwt({
      sub: "mod-uuid",
      role: "MODERATOR",
      email: "mod@bharatbazaar.in",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem("admin_access_token", modToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Moderation Queue</div>
      </AdminRoleGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.getByText("MODERATOR")).toBeInTheDocument();
  });

  it("should sign out and return to login view when clicking Sign Out", async () => {
    const adminToken = createTestJwt({
      sub: "admin-uuid",
      role: "ADMIN",
      email: "admin@bharatbazaar.in",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem("admin_access_token", adminToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Secret Operational Console</div>
      </AdminRoleGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(window.localStorage.getItem("admin_access_token")).toBeNull();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText("Staff Authentication Required")).toBeInTheDocument();
  });

  it("should terminate session when admin:unauthorized event is dispatched", async () => {
    const adminToken = createTestJwt({
      sub: "admin-uuid",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    window.localStorage.setItem("admin_access_token", adminToken);

    render(
      <AdminRoleGuard>
        <div data-testid="protected-content">Live Dashboard</div>
      </AdminRoleGuard>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();

    // Trigger 401 unauthorized event
    act(() => {
      window.dispatchEvent(new CustomEvent("admin:unauthorized"));
    });

    await waitFor(() => {
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByText(/Session expired or unauthorized/i)).toBeInTheDocument();
    });
  });
});
