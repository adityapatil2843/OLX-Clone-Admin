"use client";

import * as React from "react";
import { initialBusinesses } from "@/lib/mock-data";
import { BusinessAccount, BusinessTier, VerificationStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Building2,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  FileText,
  Star,
  ExternalLink,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BusinessManagementPage() {
  const [businesses, setBusinesses] = React.useState<BusinessAccount[]>(initialBusinesses);
  const [search, setSearch] = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedBusiness, setSelectedBusiness] = React.useState<BusinessAccount | null>(null);

  // Upgrade or Verify Action modal
  const [actionModal, setActionModal] = React.useState<{
    open: boolean;
    business: BusinessAccount | null;
    action: "upgrade_diamond" | "verify_gst" | "suspend";
  }>({
    open: false,
    business: null,
    action: "verify_gst",
  });

  const filteredBusinesses = React.useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        b.companyName.toLowerCase().includes(search.toLowerCase()) ||
        b.brandName.toLowerCase().includes(search.toLowerCase()) ||
        b.gstin.toLowerCase().includes(search.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase());

      const matchesTier = tierFilter === "all" || b.tier === tierFilter;
      const matchesStatus = statusFilter === "all" || b.verificationStatus === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [businesses, search, tierFilter, statusFilter]);

  const handleExecuteAction = () => {
    if (!actionModal.business) return;
    const { business, action } = actionModal;

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== business.id) return b;
        if (action === "upgrade_diamond") return { ...b, tier: "Diamond" as BusinessTier };
        if (action === "verify_gst")
          return {
            ...b,
            verificationStatus: "approved" as VerificationStatus,
            badgeVerified: true,
          };
        if (action === "suspend")
          return {
            ...b,
            verificationStatus: "suspended" as VerificationStatus,
            badgeVerified: false,
          };
        return b;
      })
    );

    if (action === "upgrade_diamond") toast.success(`Upgraded ${business.brandName} to Diamond Tier!`);
    if (action === "verify_gst") toast.success(`GSTIN ${business.gstin} verified successfully!`);
    if (action === "suspend") toast.warning(`Business storefront suspended`);

    if (selectedBusiness?.id === business.id) setSelectedBusiness(null);
  };

  const getTierBadge = (tier: BusinessTier) => {
    switch (tier) {
      case "Diamond":
        return (
          <Badge variant="purple" className="flex items-center gap-1 font-bold">
            <Award className="h-3 w-3" /> Diamond
          </Badge>
        );
      case "Gold":
        return (
          <Badge variant="warning" className="flex items-center gap-1 font-bold">
            <Award className="h-3 w-3" /> Gold
          </Badge>
        );
      case "Silver":
        return (
          <Badge variant="secondary" className="flex items-center gap-1 font-bold">
            <Award className="h-3 w-3" /> Silver
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-sky-600" />
            Verified Business Storefronts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage GSTIN verified enterprises, merchant tier upgrades (Silver, Gold, Diamond), and B2C sales volumes.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by company, brand name, GSTIN, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full sm:w-36 text-xs h-9"
            >
              <option value="all">All Tiers</option>
              <option value="Diamond">Diamond</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 text-xs h-9"
            >
              <option value="all">All Statuses</option>
              <option value="approved">GST Approved</option>
              <option value="pending">Review Pending</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Businesses Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Registered Enterprises</CardTitle>
            <CardDescription>Showing {filteredBusinesses.length} merchant profiles</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Business & Brand</th>
                <th className="px-5 py-3 font-semibold">GSTIN & PAN</th>
                <th className="px-5 py-3 font-semibold">Tier</th>
                <th className="px-5 py-3 font-semibold">Location</th>
                <th className="px-5 py-3 font-semibold">Monthly GMV</th>
                <th className="px-5 py-3 font-semibold">Rating & Ads</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No businesses match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Brand */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={biz.avatar}
                          alt={biz.brandName}
                          className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 truncate">
                              {biz.brandName}
                            </span>
                            {biz.badgeVerified && (
                              <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {biz.companyName}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* GSTIN & Category */}
                    <td className="px-5 py-3 font-mono text-xs">
                      <span className="font-semibold text-slate-900 block">{biz.gstin}</span>
                      <span className="text-[11px] font-sans text-slate-500 block">
                        {biz.tradeCategory}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="px-5 py-3">{getTierBadge(biz.tier)}</td>

                    {/* Location */}
                    <td className="px-5 py-3">
                      <span className="text-slate-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {biz.city}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{biz.state}</span>
                    </td>

                    {/* Monthly GMV */}
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-900">{formatINR(biz.monthlyGmv)}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> High Volume
                      </span>
                    </td>

                    {/* Rating & Listings */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        <span>{biz.rating}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {biz.totalListings} active ads
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setSelectedBusiness(biz)}
                        >
                          Profile
                        </Button>
                        {biz.verificationStatus !== "approved" ? (
                          <Button
                            size="sm"
                            variant="success"
                            className="h-8 text-xs"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                business: biz,
                                action: "verify_gst",
                              })
                            }
                          >
                            Verify GST
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
                            onClick={() =>
                              setActionModal({
                                open: true,
                                business: biz,
                                action: "upgrade_diamond",
                              })
                            }
                          >
                            Tier
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Business Details Drawer / Modal */}
      {selectedBusiness && (
        <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
          <DialogHeader onClose={() => setSelectedBusiness(null)}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedBusiness.avatar}
                alt={selectedBusiness.brandName}
                className="h-12 w-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {selectedBusiness.brandName}
                  {getTierBadge(selectedBusiness.tier)}
                </DialogTitle>
                <DialogDescription>
                  {selectedBusiness.companyName} • Member since{" "}
                  {formatDate(selectedBusiness.joinedDate, "MMM yyyy")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 space-y-4 text-xs">
            {/* Legal and GST Information */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Legal & Tax Registration
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">GSTIN</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBusiness.gstin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PAN</span>
                  <span className="font-mono font-bold text-slate-900">{selectedBusiness.panNumber}</span>
                </div>
              </div>
            </div>

            {/* Address & Storefront details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Physical Storefront
              </span>
              <p className="text-slate-700 leading-relaxed">{selectedBusiness.address}</p>
            </div>

            {/* Owner contact details */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center gap-2 border border-slate-100">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-800 font-medium">{selectedBusiness.ownerPhone}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center gap-2 border border-slate-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-800 font-medium truncate">{selectedBusiness.ownerEmail}</span>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 block text-[11px]">Monthly GMV</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatINR(selectedBusiness.monthlyGmv)}
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg p-3">
                <span className="text-slate-500 block text-[11px]">Active Listings</span>
                <span className="text-base font-bold text-sky-600 mt-1 block">
                  {selectedBusiness.totalListings} Units
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionModal({
                  open: true,
                  business: selectedBusiness,
                  action: "upgrade_diamond",
                });
              }}
            >
              Upgrade to Diamond Tier
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setActionModal({
                  open: true,
                  business: selectedBusiness,
                  action: "suspend",
                });
              }}
            >
              Suspend Store
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={actionModal.open}
        onOpenChange={(open) => setActionModal((prev) => ({ ...prev, open }))}
        title={
          actionModal.action === "upgrade_diamond"
            ? "Upgrade to Diamond Tier?"
            : actionModal.action === "verify_gst"
            ? "Approve GSTIN Verification?"
            : "Suspend Business Storefront?"
        }
        description={`Execute ${actionModal.action} for "${actionModal.business?.brandName}"? This updates seller privileges and visibility on the video feed.`}
        confirmLabel="Confirm"
        variant={actionModal.action === "suspend" ? "destructive" : "success"}
        onConfirm={handleExecuteAction}
      />
    </div>
  );
}
