"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Film,
  AlertOctagon,
  Megaphone,
  ArrowRight,
  ShieldAlert,
  Clock,
  RefreshCw,
  FolderTree,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCompactNumber } from "@/lib/utils";
import { useAdminMetrics } from "@/features/admin/hooks";

export default function DashboardOverviewPage() {
  const { data: metrics, loading: metricsLoading, error: metricsError, reload } = useAdminMetrics();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-semibold text-sky-300 border border-sky-400/30">
              Operational Command Center
            </span>
            <span className="text-xs text-slate-300">Live Backend Mode</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            BharatBazaar Moderation Command
          </h1>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
            Live counts are queried directly from the backend server admin metrics endpoint. No simulated growth charts or fake analytics counters.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void reload()}
            className="border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 hover:text-white text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Counts
          </Button>
          <Link href="/reports">
            <Button variant="default" size="sm" className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-md text-xs h-9">
              <ShieldAlert className="h-4 w-4 mr-1 text-slate-950" />
              Open Reports Queue
            </Button>
          </Link>
        </div>
      </div>

      {metricsError && (
        <Card className="border-rose-200 bg-rose-50 text-rose-900">
          <CardContent className="py-4 text-xs font-medium flex items-center justify-between">
            <span>Live server metrics failed to load: {metricsError}</span>
            <Button size="sm" variant="outline" onClick={() => void reload()} className="h-7 text-xs border-rose-300 bg-white">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Verified Live KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Registered Users"
          value={metricsLoading ? "…" : metrics ? formatCompactNumber(metrics.users.total) : "—"}
          label={metrics ? `${formatCompactNumber(metrics.users.active)} currently active` : "live server count"}
          icon={Users}
          iconColor="text-sky-600 bg-sky-50 border-sky-200"
        />
        <StatCard
          title="Active Listings"
          value={metricsLoading ? "…" : metrics ? formatCompactNumber(metrics.listings.active) : "—"}
          label={metrics ? `${formatCompactNumber(metrics.listings.sold)} marked sold` : "live active listings"}
          icon={ShoppingBag}
          iconColor="text-emerald-600 bg-emerald-50 border-emerald-200"
        />
        <StatCard
          title="Published Video Reels"
          value={metricsLoading ? "…" : metrics ? formatCompactNumber(metrics.reels.published) : "—"}
          label={metrics ? `${formatCompactNumber(metrics.reels.total)} total submitted` : "live published reels"}
          icon={Film}
          iconColor="text-purple-600 bg-purple-50 border-purple-200"
        />
        <StatCard
          title="Pending Reports"
          value={metricsLoading ? "…" : metrics ? String(metrics.reports.pending) : "—"}
          label="actionable user flags"
          icon={AlertOctagon}
          iconColor="text-rose-600 bg-rose-50 border-rose-200"
        />
        <StatCard
          title="Active Advertisements"
          value={metricsLoading ? "…" : metrics ? formatCompactNumber(metrics.advertisements.active) : "—"}
          label={metrics ? `${formatCompactNumber(metrics.advertisements.total)} total ad records` : "active boost campaigns"}
          icon={Megaphone}
          iconColor="text-amber-600 bg-amber-50 border-amber-200"
        />
      </div>

      {metrics?.retrievedAt && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 px-1">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Last synchronized with database: {new Date(metrics.retrievedAt).toLocaleString("en-IN")}</span>
        </div>
      )}

      {/* Operational Modules Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-sky-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-600" />
              User Account Moderation
            </CardTitle>
            <CardDescription className="text-xs">
              Search by name/city, promote staff to MODERATOR/ADMIN, and toggle account activation.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/users">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Users Directory <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              Listings Moderation Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Inspect active catalog items, verify pricing and specs, and archive/take down policy violations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/listings">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Review Marketplace Listings <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-rose-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-purple-600" />
              Reels Video Content Review
            </CardTitle>
            <CardDescription className="text-xs">
              Preview short-video product walkarounds, examine creator profiles, and archive violating media.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/reels">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Moderate Video Reels <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              Dispute & Reports Inbox
            </CardTitle>
            <CardDescription className="text-xs">
              Resolve user complaints, dismiss false flags, and log resolution notes to audit logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/reports">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Open Reports Inbox <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-indigo-600" />
              Category Taxonomy
            </CardTitle>
            <CardDescription className="text-xs">
              Configure marketplace category tree, create new verticals, and toggle category visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/categories">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Taxonomy <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              System Audit Trails
            </CardTitle>
            <CardDescription className="text-xs">
              Inspect immutable records of all moderation interventions, role changes, and resolution notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/audit-logs">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Audit Trail <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Backend Scope & Unsupported Capability Notice */}
      <Card className="border-slate-200 bg-slate-50/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Backend Scope & Deferred Analytics Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <p>
            • <strong>Historical Analytics:</strong> Time-series charts (weekly listing velocity, monthly GMV estimates, viral engagement graphs) are not exposed by the server API. In accordance with zero-fake-data rules, simulated charts have been omitted from production view.
          </p>
          <p>
            • <strong>Seller KYC Verification:</strong> Dedicated seller verification endpoints and KYC tables do not exist on the backend yet. The KYC module route (/verifications) displays a documented blocker notice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
