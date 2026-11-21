"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShoppingBag,
  Film,
  AlertOctagon,
  FolderTree,
  Building2,
  ShieldCheck,
  BellRing,
  Megaphone,
  History,
  Settings,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMetrics } from "@/features/admin/hooks";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const navigationItems = [
  {
    title: "Core",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Marketplace & Content",
    items: [
      { name: "Users", href: "/users", icon: Users },
      { name: "Listings", href: "/listings", icon: ShoppingBag },
      { name: "Reel Moderation", href: "/reels", icon: Film, highlight: true },
      { name: "Reports & Queue", href: "/reports", icon: AlertOctagon },
      { name: "Categories", href: "/categories", icon: FolderTree },
    ],
  },
  {
    title: "Trust & Growth",
    items: [
      { name: "Business Profiles", href: "/businesses", icon: Building2 },
      { name: "KYC & Verifications", href: "/verifications", icon: ShieldCheck },
      { name: "Notifications", href: "/notifications", icon: BellRing },
      { name: "Advertisements", href: "/ads", icon: Megaphone },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Audit Logs", href: "/audit-logs", icon: History },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: metrics } = useAdminMetrics();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-200/80 bg-white transition-all duration-300 md:flex flex-col justify-between",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 transition-all overflow-hidden",
              collapsed ? "justify-center w-full" : ""
            )}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center p-0.5">
              <Image
                src="/logo-1.png"
                alt="Bazarr360 Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-none truncate">
                  Bazarr<span className="text-sky-600">360</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase mt-1 truncate">
                  Admin Console
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto px-3 py-4 space-y-6 max-h-[calc(100vh-8rem)]">
          {navigationItems.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                const badge = item.name === "Reports & Queue" && metrics ? String(metrics.reports.pending) : undefined;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-sky-50 text-sky-700 font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive
                          ? "text-sky-600"
                          : "text-slate-400 group-hover:text-slate-700",
                        item.highlight && !isActive && "text-sky-500"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!collapsed && badge && (
                      <span
                        className={cn(
                          "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          "bg-rose-100 text-rose-700"
                        )}
                      >
                        {badge}
                      </span>
                    )}

                    {collapsed && badge && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle Footer with Lucide Arrow */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand sidebar (Arrow Right)" : "Collapse sidebar (Arrow Left)"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ArrowRight className="h-4 w-4 text-slate-600 hover:text-slate-900 transition-transform" />
          ) : (
            <>
              <ArrowLeft className="h-4 w-4 text-slate-600 hover:text-slate-900 transition-transform" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
