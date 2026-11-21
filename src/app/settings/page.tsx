"use client";

import * as React from "react";
import { defaultAdminProfile, defaultPlatformSettings } from "@/lib/mock-data";
import { AdminProfile, PlatformSettings } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings,
  Shield,
  Save,
  Key,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");
  const [adminProfile, setAdminProfile] = React.useState<AdminProfile>(defaultAdminProfile);
  const [platformSettings, setPlatformSettings] = React.useState<PlatformSettings>(defaultPlatformSettings);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Admin profile updated successfully!");
    }, 400);
  };

  const handleSavePlatform = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Marketplace operational rules deployed successfully!");
    }, 400);
  };

  const toggle2FA = () => {
    setAdminProfile((prev) => {
      const next = !prev.twoFactorEnabled;
      toast.info(`Two-Factor Authentication (2FA) ${next ? "Enabled" : "Disabled"}`);
      return { ...prev, twoFactorEnabled: next };
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-sky-600" />
            Settings & Platform Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure admin credentials, video ingestion constraints, AI safety thresholds, and marketplace operational policies.
          </p>
        </div>

        <Badge variant="warning" className="w-fit text-xs px-3 py-1 font-semibold">
          Demo Mode: Backend API Missing
        </Badge>
      </div>

      {/* Blocker & Unsupported Capability Notice */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-base">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            Platform Preferences - Demonstration Mode Only
          </div>
          <CardDescription className="text-amber-800 text-xs mt-1 leading-relaxed">
            Settings persistence endpoints are not implemented on the server. Values displayed below are client-side demonstration parameters only and do not alter production database configurations.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="general">Platform Operations</TabsTrigger>
          <TabsTrigger value="profile">Admin Profile</TabsTrigger>
          <TabsTrigger value="security">Security & 2FA</TabsTrigger>
        </TabsList>

        {/* Tab 1: Platform Operations */}
        <TabsContent value="general">
          <form onSubmit={handleSavePlatform} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Video Reel & Media Policies</CardTitle>
                <CardDescription>
                  Configure mobile video recording duration, upload limits, and automated moderation rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Max Reel Duration (Seconds)
                    </label>
                    <Input
                      type="number"
                      min="15"
                      max="120"
                      value={platformSettings.maxReelDurationSeconds}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxReelDurationSeconds: Number(e.target.value),
                        })
                      }
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Recommended: 30s to 60s for highest buyer inquiry conversion.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Max Video Upload Size (MB)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="200"
                      value={platformSettings.maxReelUploadMb}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxReelUploadMb: Number(e.target.value),
                        })
                      }
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Videos are automatically transcode-optimized to 1080p H.264/AAC.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      AI Auto-Moderation Sensitivity
                    </label>
                    <Select
                      value={platformSettings.aiAutoModerationSensitivity}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          aiAutoModerationSensitivity: e.target.value as PlatformSettings["aiAutoModerationSensitivity"],
                        })
                      }
                    >
                      <option value="strict">Strict (Auto-quarantine suspected stunts & weapons)</option>
                      <option value="medium">Medium (Standard safety filters)</option>
                      <option value="low">Low (Community reporting only)</option>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Free Listings Per Seller Account
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={platformSettings.maxFreeListingsPerUser}
                      onChange={(e) =>
                        setPlatformSettings({
                          ...platformSettings,
                          maxFreeListingsPerUser: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Operational Marketplace Switches</CardTitle>
                <CardDescription>
                  Emergency controls for platform maintenance and onboarding switches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">
                      Auto-Approve GST Verified Sellers
                    </span>
                    <span className="text-xs text-slate-500">
                      Bypasses manual listing queues for merchants with active Diamond or Gold status.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.autoApproveVerifiedSellers}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        autoApproveVerifiedSellers: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm block">
                      Allow New Buyer/Seller Registrations
                    </span>
                    <span className="text-xs text-slate-500">
                      Permit OTP-based user registrations across India.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.newRegistrationsAllowed}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        newRegistrationsAllowed: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-200">
                  <div>
                    <span className="font-semibold text-rose-900 text-sm block flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-600" />
                      Maintenance Mode
                    </span>
                    <span className="text-xs text-rose-700">
                      Restricts frontend app access to admin staff only.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformSettings.maintenanceMode}
                    onChange={(e) =>
                      setPlatformSettings({
                        ...platformSettings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="h-5 w-5 rounded border-rose-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Save Platform Preferences"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Admin Profile */}
        <TabsContent value="profile">
          <form onSubmit={handleSaveProfile}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Administrator Profile Information</CardTitle>
                <CardDescription>
                  Update your contact details and administrative identity credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={adminProfile.avatar}
                    alt={adminProfile.name}
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-sky-500/20"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-base">{adminProfile.name}</h4>
                    <p className="text-xs text-slate-500">{adminProfile.role} • {adminProfile.department}</p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Last sign-in: {adminProfile.lastLogin}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name
                    </label>
                    <Input
                      value={adminProfile.name}
                      onChange={(e) =>
                        setAdminProfile({ ...adminProfile, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Official Admin Email
                    </label>
                    <Input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) =>
                        setAdminProfile({ ...adminProfile, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Contact Phone
                    </label>
                    <Input
                      value={adminProfile.phone}
                      onChange={(e) =>
                        setAdminProfile({ ...adminProfile, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Assigned Department
                    </label>
                    <Input
                      value={adminProfile.department}
                      onChange={(e) =>
                        setAdminProfile({ ...adminProfile, department: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Update Profile"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 3: Security & 2FA */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Authentication & Two-Factor (2FA)</CardTitle>
                <CardDescription>
                  Hardware token and TOTP authenticator protection for moderation privileges.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-sm block">
                        Two-Factor Authentication (TOTP)
                      </span>
                      <span className="text-xs text-slate-500">
                        Requires Google Authenticator or YubiKey verification on sign-in.
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={adminProfile.twoFactorEnabled ? "destructive" : "default"}
                    size="sm"
                    onClick={toggle2FA}
                  >
                    {adminProfile.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 text-sm block">
                        Admin Master Password
                      </span>
                      <span className="text-xs text-slate-500">
                        Last changed 42 days ago from HQ workstation.
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Password change modal triggered in mock mode")}
                    >
                      <Key className="h-4 w-4 mr-1.5 text-slate-400" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
