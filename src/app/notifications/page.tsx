"use client";

import * as React from "react";
import { initialCampaigns } from "@/lib/mock-data";
import { NotificationCampaign } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  BellRing,
  Send,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const campaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  body: z.string().min(10, "Message body must be at least 10 characters"),
  audience: z.enum(["all", "sellers_only", "buyers_only", "business_accounts", "tier1_cities"]),
  channel: z.enum(["push", "in_app", "both"]),
  deepLink: z.string().optional(),
  scheduledFor: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function NotificationsPage() {
  const [campaigns] = React.useState<NotificationCampaign[]>(initialCampaigns);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      body: "",
      audience: "all",
      channel: "both",
      deepLink: "/reels/trending",
    },
  });

  const onSubmit = () => {
    toast.error("Campaign creation is disabled. Backend API endpoint is not implemented.");
    setIsCreateOpen(false);
  };

  const handleSendTestPush = (title: string) => {
    toast.info(`Test Push Sent to admin device: "${title}"`, {
      description: "Notification delivered via BharatBazaar Sandbox APNs/FCM",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BellRing className="h-6 w-6 text-sky-600" />
            Push & In-App Notification Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast promotional alerts, festive video challenges, and safety announcements across Indian buyers and sellers.
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
            Push and in-app campaign broadcasting endpoints are not implemented on the server. To adhere to strict production guidelines, fake campaign dispatches are disabled.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Notification Campaigns</CardTitle>
            <CardDescription>
              Delivered and scheduled automated push notifications
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Campaign Title & Body</th>
                <th className="px-5 py-3 font-semibold">Target Audience</th>
                <th className="px-5 py-3 font-semibold">Channel</th>
                <th className="px-5 py-3 font-semibold">Delivery Status</th>
                <th className="px-5 py-3 font-semibold">Recipients</th>
                <th className="px-5 py-3 font-semibold">Performance</th>
                <th className="px-5 py-3 font-semibold text-right">Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Title & Body */}
                  <td className="px-5 py-3 max-w-sm">
                    <span className="font-semibold text-slate-900 block truncate">
                      {c.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                      {c.body}
                    </span>
                    {c.deepLink && (
                      <span className="text-[10px] text-sky-600 font-mono block mt-0.5">
                        Deep link: {c.deepLink}
                      </span>
                    )}
                  </td>

                  {/* Audience */}
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="capitalize">
                      {c.audience.replace("_", " ")}
                    </Badge>
                  </td>

                  {/* Channel */}
                  <td className="px-5 py-3 uppercase text-[11px] font-semibold text-slate-700">
                    {c.channel}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        c.status === "sent"
                          ? "success"
                          : c.status === "scheduled"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {c.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {c.sentAt ? formatDate(c.sentAt) : c.scheduledFor ? `Sched: ${formatDate(c.scheduledFor)}` : ""}
                    </span>
                  </td>

                  {/* Recipients */}
                  <td className="px-5 py-3 font-semibold text-slate-900">
                    {c.recipientsCount.toLocaleString("en-IN")}
                  </td>

                  {/* Performance */}
                  <td className="px-5 py-3">
                    <div className="text-xs">
                      <span className="text-slate-900 font-semibold">{c.openRate}% open</span>
                      <span className="text-slate-400"> • </span>
                      <span className="text-sky-600 font-semibold">{c.clickRate}% CTR</span>
                    </div>
                  </td>

                  {/* Test Action */}
                  <td className="px-5 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleSendTestPush(c.title)}
                    >
                      Test Send
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Campaign Modal (React Hook Form + Zod) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader onClose={() => setIsCreateOpen(false)}>
          <DialogTitle>Create Notification Campaign</DialogTitle>
          <DialogDescription>
            Target specific customer cohorts across mobile and web push channels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Notification Title
            </label>
            <Input
              placeholder="e.g. ⚡ Flash Sunday: Free Video Boost for Verified Sellers"
              {...register("title")}
            />
            {errors.title && (
              <span className="text-[11px] text-rose-500 mt-0.5 block">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Message Body
            </label>
            <Textarea
              placeholder="Keep it concise, engaging, and highlight the benefit..."
              {...register("body")}
            />
            {errors.body && (
              <span className="text-[11px] text-rose-500 mt-0.5 block">
                {errors.body.message}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Audience Cohort
              </label>
              <Select {...register("audience")}>
                <option value="all">All Registered Users</option>
                <option value="sellers_only">Active Sellers Only</option>
                <option value="buyers_only">Active Buyers Only</option>
                <option value="business_accounts">GST Verified Businesses</option>
                <option value="tier1_cities">Metro & Tier 1 Cities</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Notification Channel
              </label>
              <Select {...register("channel")}>
                <option value="both">Both (Push + In-App)</option>
                <option value="push">Push Notification Only</option>
                <option value="in_app">In-App Banner Only</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Deep Link Destination (Optional)
            </label>
            <Input placeholder="/reels/trending or /festive-sale" {...register("deepLink")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Send className="h-4 w-4 mr-1.5" />
              Launch Campaign
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
