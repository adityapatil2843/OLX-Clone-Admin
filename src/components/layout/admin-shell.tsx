"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { Toaster } from "sonner";
import { AdminRoleGuard } from "./admin-role-guard";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className={cn("min-h-screen transition-[margin] duration-300", collapsed ? "md:ml-20" : "md:ml-64")}>
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          <AdminRoleGuard>{children}</AdminRoleGuard>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
