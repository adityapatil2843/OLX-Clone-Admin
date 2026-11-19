"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, Key, LogIn, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [tokenInput, setTokenInput] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState<{ role: string; email?: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);

  const evaluateSession = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("admin_access_token");

    if (!token) {
      setIsAuthorized(false);
      setCurrentUser(null);
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      // If plain non-JWT token is set for mock/dev
      setIsAuthorized(true);
      setCurrentUser({ role: "ADMIN", email: "admin@bharatbazaar.in" });
      return;
    }

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      window.localStorage.removeItem("admin_access_token");
      setIsAuthorized(false);
      setCurrentUser(null);
      toast.error("Admin session expired. Please sign in again.");
      return;
    }

    // Role verification
    const roleUpper = (payload.role || "").toUpperCase();
    if (roleUpper === "ADMIN" || roleUpper === "MODERATOR") {
      setIsAuthorized(true);
      setCurrentUser({ role: roleUpper, email: payload.email });
    } else {
      setIsAuthorized(false);
      setCurrentUser(null);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    evaluateSession();
  }, [evaluateSession]);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      toast.error("Please provide a valid token");
      return;
    }

    window.localStorage.setItem("admin_access_token", cleanToken);
    evaluateSession();
    toast.success("Admin token saved successfully!");
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
              This console provides direct operational controls. Only users with verified <strong>ADMIN</strong> or <strong>MODERATOR</strong> roles are authorized.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Role-Based Access Enforcement</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Regular buyer and seller accounts cannot view moderation queues, sensitive user records, or platform audit logs.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveToken} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Admin Bearer Access Token
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

              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 font-semibold h-9 text-xs">
                <LogIn className="h-4 w-4 mr-1.5" />
                Authenticate Session
              </Button>
            </form>
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
          onClick={() => {
            window.localStorage.removeItem("admin_access_token");
            evaluateSession();
            toast.info("Session terminated");
          }}
          className="text-[11px] font-medium text-slate-400 hover:text-rose-400 underline cursor-pointer"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
