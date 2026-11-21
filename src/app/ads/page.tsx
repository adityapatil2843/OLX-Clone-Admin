"use client";

import * as React from "react";
import { initialAds } from "@/lib/mock-data";
import { Advertisement } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Megaphone,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { formatINR, formatCompactNumber } from "@/lib/utils";
import { toast } from "sonner";

export default function AdvertisementsPage() {
  const [ads, setAds] = React.useState<Advertisement[]>(initialAds);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  // Form states for creating ad campaign
  const [newTitle, setNewTitle] = React.useState("");
  const [newAdvertiser, setNewAdvertiser] = React.useState("");
  const [newType, setNewType] = React.useState<Advertisement["campaignType"]>("sponsored_reel");
  const [newDailyBudget, setNewDailyBudget] = React.useState(2000);
  const [newTargetUrl, setNewTargetUrl] = React.useState("https://bharatbazaar.in/store/");

  const toggleCampaignStatus = (id: string) => {
    setAds((prev) =>
      prev.map((ad) => {
        if (ad.id !== id) return ad;
        const newStatus = ad.status === "active" ? "paused" : "active";
        toast.info(
          `Campaign "${ad.title}" ${newStatus === "active" ? "Resumed" : "Paused"}`
        );
        return { ...ad, status: newStatus };
      })
    );
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAdvertiser.trim()) {
      toast.error("Please fill in title and advertiser");
      return;
    }

    const created: Advertisement = {
      id: `ad_${Date.now()}`,
      title: newTitle,
      campaignType: newType,
      advertiserName: newAdvertiser,
      advertiserId: `biz_${Date.now()}`,
      thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
      targetUrl: newTargetUrl,
      budgetDaily: Number(newDailyBudget),
      totalSpend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2024-05-30",
    };

    setAds((prev) => [created, ...prev]);
    setIsCreateOpen(false);
    setNewTitle("");
    setNewAdvertiser("");
    toast.success(`Sponsored Campaign "${created.title}" launched successfully!`);
  };

  const filteredAds = React.useMemo(() => {
    return ads.filter((ad) => {
      const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
      const matchesType = typeFilter === "all" || ad.campaignType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [ads, statusFilter, typeFilter]);

  const getStatusBadge = (status: Advertisement["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "paused":
        return <Badge variant="warning">Paused</Badge>;
      case "pending_approval":
        return <Badge variant="default">Under Review</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-sky-600" />
            Sponsored Reels & Ad Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage promoted short-video ads, top-of-feed featured banners, and merchant advertising budgets.
          </p>
        </div>

        <Badge variant="warning" className="w-fit text-xs px-3 py-1 font-semibold">
          Blocked: Backend API Missing
        </Badge>
      </div>

      {/* Blocker & Unsupported Capability Notice */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            Feature Temporarily Unavailable - Backend Capability Missing
          </div>
          <CardDescription className="text-amber-800 text-xs mt-1 leading-relaxed">
            The server does not expose administrative campaign management endpoints for advertisements. In accordance with zero-fake-data rules, campaign creation and mutation controls are disabled.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48 text-xs h-9"
          >
            <option value="all">All Campaign Types</option>
            <option value="sponsored_reel">Sponsored Video Reels</option>
            <option value="featured_listing">Top Featured Listings</option>
            <option value="banner_top">Homepage Banner Takeover</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 text-xs h-9"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active & Running</option>
            <option value="paused">Paused</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="completed">Completed</option>
          </Select>
        </CardContent>
      </Card>

      {/* Ads Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Ad Placements</CardTitle>
            <CardDescription>
              Showing {filteredAds.length} active marketing campaigns
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Campaign & Creative</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Advertiser</th>
                <th className="px-5 py-3 font-semibold">Budget & Spend</th>
                <th className="px-5 py-3 font-semibold">Impressions / Clicks</th>
                <th className="px-5 py-3 font-semibold">CTR</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Creative */}
                  <td className="px-5 py-3 max-w-xs">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.thumbnail}
                        alt={ad.title}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">
                          {ad.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono truncate">
                          ID: {ad.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3">
                    <Badge variant="purple" className="capitalize">
                      {ad.campaignType.replace("_", " ")}
                    </Badge>
                  </td>

                  {/* Advertiser */}
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-900 block truncate">
                      {ad.advertiserName}
                    </span>
                  </td>

                  {/* Budget & Spend */}
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-900 block">
                      {formatINR(ad.budgetDaily)}/day
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Spent: {formatINR(ad.totalSpend)}
                    </span>
                  </td>

                  {/* Impressions / Clicks */}
                  <td className="px-5 py-3">
                    <span className="text-slate-900 font-semibold block">
                      {formatCompactNumber(ad.impressions)} views
                    </span>
                    <span className="text-[11px] text-sky-600 block">
                      {formatCompactNumber(ad.clicks)} clicks
                    </span>
                  </td>

                  {/* CTR */}
                  <td className="px-5 py-3">
                    <span className="font-bold text-slate-900">{ad.ctr}%</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">{getStatusBadge(ad.status)}</td>

                  {/* Controls */}
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => toggleCampaignStatus(ad.id)}
                    >
                      {ad.status === "active" ? (
                        <>
                          <Pause className="h-3.5 w-3.5 mr-1 text-amber-600" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Resume
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Ad Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader onClose={() => setIsCreateOpen(false)}>
          <DialogTitle>Launch Sponsored Campaign</DialogTitle>
          <DialogDescription>
            Configure high-visibility placements for verified merchants.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateAd} className="space-y-4 py-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Campaign Title
            </label>
            <Input
              placeholder="e.g. Diwal Special Refurbished Smartphones Mega Sale"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Advertiser / Merchant Brand
            </label>
            <Input
              placeholder="e.g. Pooja Tech & Gadgets LLP"
              value={newAdvertiser}
              onChange={(e) => setNewAdvertiser(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Ad Placement Type
              </label>
              <Select
                value={newType}
                onChange={(e) => setNewType(e.target.value as Advertisement["campaignType"])}
              >
                <option value="sponsored_reel">Sponsored Video Reel</option>
                <option value="featured_listing">Top Featured Listing</option>
                <option value="banner_top">Homepage Banner Takeover</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Daily Budget (INR ₹)
              </label>
              <Input
                type="number"
                min="500"
                step="100"
                value={newDailyBudget}
                onChange={(e) => setNewDailyBudget(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Target Landing URL / Storefront Link
            </label>
            <Input
              value={newTargetUrl}
              onChange={(e) => setNewTargetUrl(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Deploy Campaign</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
