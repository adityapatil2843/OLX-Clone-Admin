"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  RefreshCw,
  Users,
  Film,
  ShoppingBag,
  AlertOctagon,
  Megaphone,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useAdminMetrics } from "@/features/admin/hooks";
import { formatDate } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data: metrics, loading, error, reload } = useAdminMetrics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-sky-600" />
            Marketplace Analytics & Live Platform Metrics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time aggregate platform metrics fetched directly from <code className="text-xs font-mono bg-slate-100 px-1 py-0.5 rounded">GET /api/v1/admin/metrics</code>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={reload}
          disabled={loading}
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          <p className="font-semibold">Unable to fetch live admin metrics</p>
          <p className="text-xs text-rose-700 mt-0.5">{error}</p>
        </div>
      )}

      {/* Live Verified Server Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Users */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">User Accounts</span>
              <Users className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : (metrics?.users.total ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Active users</span>
              <span className="font-semibold text-emerald-600">{loading ? "-" : (metrics?.users.active ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Classified Listings</span>
              <ShoppingBag className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : (metrics?.listings.total ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Active: <strong className="text-slate-800">{loading ? "-" : (metrics?.listings.active ?? 0)}</strong></span>
              <span>Sold: <strong className="text-emerald-600">{loading ? "-" : (metrics?.listings.sold ?? 0)}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Reels */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Video Reels</span>
              <Film className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : (metrics?.reels.total ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Published feed</span>
              <span className="font-semibold text-purple-600">{loading ? "-" : (metrics?.reels.published ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Advertisements */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Advertisements</span>
              <Megaphone className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? "-" : (metrics?.advertisements.total ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Active ads</span>
              <span className="font-semibold text-indigo-600">{loading ? "-" : (metrics?.advertisements.active ?? 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Reports */}
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Pending Reports</span>
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "-" : (metrics?.reports.pending ?? 0)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Requires action</span>
              <span className="font-semibold text-rose-600">{metrics && metrics.reports.pending > 0 ? "Review needed" : "Clean"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {metrics?.retrievedAt && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          Metrics synchronized at {formatDate(metrics.retrievedAt)}
        </div>
      )}

      {/* Unsupported Backend Capabilities Notice for Time-Series Trends */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Historical Time-Series & Velocity Analytics
              </CardTitle>
              <CardDescription className="mt-1">
                Notice regarding time-series curves, daily GMV velocity, and geographic cohorts
              </CardDescription>
            </div>
            <Badge variant="secondary">Unsupported Backend Capability</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed">
            The server currently implements point-in-time snapshot metrics via <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">GET /api/v1/admin/metrics</code>, which power the aggregate counters above. However, the backend does not currently expose:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Time-Series Growth Trends
              </span>
              <span className="text-[11px] text-slate-500 leading-normal block">
                Daily or weekly signup/retention series require a historical aggregation endpoint (e.g. <code className="font-mono text-slate-700">/admin/analytics/users/growth</code>).
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Weekly Listing Throughput
              </span>
              <span className="text-[11px] text-slate-500 leading-normal block">
                Breakdown of listings created vs sold over custom date intervals requires date-bucketed grouping in database queries.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                City / State GMV Penetration
              </span>
              <span className="text-[11px] text-slate-500 leading-normal block">
                Geographic volume calculations require transaction or listing aggregations grouped by locality and state.
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Per strict project instructions, fake mock charts have been excluded to preserve data integrity and auditability.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
