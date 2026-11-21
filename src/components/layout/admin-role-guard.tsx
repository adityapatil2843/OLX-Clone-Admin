"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, Key, LogIn, Lock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAdminBaseUrl } from "@/lib/api-client";

export interface JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

export interface AdminUserSession {
  id?: string;
  role: "ADMIN" | "MODERATOR";
  email?: string;
}

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"login" | "token">("login");
  const [emailInput, setEmailInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");
  const [tokenInput, setTokenInput] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState<AdminUserSession | null>(null);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const evaluateSession = React.useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    const token = window.localStorage.getItem("admin_access_token");

    if (!token) {
      setIsAuthorized(false);
      setCurrentUser(null);
      setAuthError(null);
      return false;
    }

    const payload = parseJwt(token);
    // Security enforcement: Reject non-JWT or malformed tokens. Never default to ADMIN.
    if (!payload) {
      window.localStorage.removeItem("admin_access_token");
      setIsAuthorized(false);
      setCurrentUser(null);
      setAuthError("Invalid token format. Bearer token must be a valid signed JWT.");
      return false;
    }

    // Expiration check
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      window.localStorage.removeItem("admin_access_token");
      setIsAuthorized(false);
      setCurrentUser(null);
      setAuthError("Session expired. Please sign in again with active staff credentials.");
      return false;
    }

    // Role verification: strictly require ADMIN or MODERATOR
    const roleUpper = (payload.role || "").toUpperCase();
    if (roleUpper === "ADMIN" || roleUpper === "MODERATOR") {
      setIsAuthorized(true);
      setCurrentUser({
        id: payload.sub,
        role: roleUpper,
        email: payload.email,
      });
      setAuthError(null);
      return true;
    }

    // Reject non-staff users (USER, SELLER, etc.)
    window.localStorage.removeItem("admin_access_token");
    setIsAuthorized(false);
    setCurrentUser(null);
    setAuthError(`Access Denied: Account role '${payload.role || "UNKNOWN"}' does not have staff privileges. ADMIN or MODERATOR role required.`);
    return false;
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    evaluateSession();

    const handleUnauthorizedEvent = () => {
      window.localStorage.removeItem("admin_access_token");
      setIsAuthorized(false);
      setCurrentUser(null);
      setAuthError("Session expired or unauthorized by backend (401). Please sign in again.");
      toast.error("Session expired. Please sign in again.");
    };

    window.addEventListener("admin:unauthorized", handleUnauthorizedEvent);
    return () => {
      window.removeEventListener("admin:unauthorized", handleUnauthorizedEvent);
    };
  }, [evaluateSession]);

  const handleBackendLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const email = emailInput.trim();
    const password = passwordInput;

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = getAdminBaseUrl();
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || body.success === false) {
        const msg = body.error?.message || body.message || `Login failed (${res.status})`;
        throw new Error(msg);
      }

      const token = body.data?.tokens?.accessToken;
      if (!token) {
        throw new Error("Backend did not return an access token.");
      }

      const payload = parseJwt(token);
      const roleUpper = (payload?.role || "").toUpperCase();
      if (roleUpper !== "ADMIN" && roleUpper !== "MODERATOR") {
        throw new Error(`Authentication rejected: Account has role '${roleUpper || "USER"}', but staff console requires ADMIN or MODERATOR.`);
      }

      window.localStorage.setItem("admin_access_token", token);
      evaluateSession();
      toast.success(`Welcome back, ${roleUpper} session authenticated!`);
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setAuthError("Please provide a valid token.");
      return;
    }

    const payload = parseJwt(cleanToken);
    if (!payload) {
      setAuthError("Invalid JWT token format. Must contain 3 dot-separated base64 segments.");
      return;
    }

    const roleUpper = (payload.role || "").toUpperCase();
    if (roleUpper !== "ADMIN" && roleUpper !== "MODERATOR") {
      setAuthError(`Token role '${roleUpper || "UNKNOWN"}' is not authorized. Must be ADMIN or MODERATOR.`);
      return;
    }

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      setAuthError("This token is already expired.");
      return;
    }

    window.localStorage.setItem("admin_access_token", cleanToken);
    evaluateSession();
    toast.success("Staff bearer token accepted!");
    setTokenInput("");
  };

  const handleSignOut = () => {
    window.localStorage.removeItem("admin_access_token");
    evaluateSession();
    toast.info("Staff session ended");
  };

  if (!isMounted) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
              <Lock className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
              Staff Authentication Required
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Authorized access only. Requires verified <strong>ADMIN</strong> or <strong>MODERATOR</strong> credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {authError && (
              <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">Authorization Error</p>
                  <p className="text-[11px] text-rose-800 mt-0.5">{authError}</p>
                </div>
              </div>
            )}

            {/* Tab switch between Live Backend Login and Dev Token */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 font-medium rounded-md transition-all ${
                  activeTab === "login"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Staff Login (Backend)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("token");
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 font-medium rounded-md transition-all ${
                  activeTab === "token"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manual Token (Dev)
              </button>
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleBackendLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Staff Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@bharatbazaar.in"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    className="text-xs h-9"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-600 hover:bg-sky-500 font-semibold h-9 text-xs"
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  {isSubmitting ? "Authenticating..." : "Sign In to Admin Console"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleManualToken} className="space-y-3">
                <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Temporary developer fallback. Token must be a valid JWT with role claim <code>ADMIN</code> or <code>MODERATOR</code>.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Bearer Access Token
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="pl-9 text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 font-semibold h-9 text-xs">
                  <Key className="h-4 w-4 mr-1.5" />
                  Validate & Save Token
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Active Staff Role Indicator Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold tracking-wide">
            Authenticated Staff Session: <span className="text-emerald-400">{currentUser?.role}</span>
          </span>
          {currentUser?.email && <span className="text-slate-400">({currentUser.email})</span>}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-[11px] font-medium text-slate-400 hover:text-rose-400 underline cursor-pointer"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
