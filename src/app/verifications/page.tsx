"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Database,
  ArrowRight,
  Server,
} from "lucide-react";

export default function VerificationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            Seller KYC & Identity Verification Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verification workflow for seller identities, government IDs (Aadhaar/PAN/GST), and trust badges.
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
            Per strict project guidelines, fake functionality and mock data fallbacks have been removed. The seller verification queue cannot be operated until corresponding backend services and database models are implemented on the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Database className="h-4 w-4 text-sky-600" />
                Missing Database Models
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The server Prisma schema currently has only a boolean flag (<code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">User.isVerifiedSeller</code>), but lacks:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li><code className="font-mono text-slate-800">VerificationRequest</code> model for document tracking</li>
                <li>Document storage keys (PAN card, Aadhaar, GSTIN certificates)</li>
                <li>Selfie biometric match records</li>
                <li>Review history and rejection reason audit fields</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Server className="h-4 w-4 text-indigo-600" />
                Missing Server Endpoints
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The server router currently does not declare or implement:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li><code className="font-mono text-slate-800">GET /api/v1/admin/verifications</code> (List pending KYC requests)</li>
                <li><code className="font-mono text-slate-800">PATCH /api/v1/admin/verifications/:id</code> (Approve/Reject review)</li>
                <li>Backend validator <code className="font-mono text-slate-800">moderateUserSchema</code> strictly rejects <code className="font-mono text-slate-800">isVerifiedSeller</code> updates</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-1">
              Next Steps for Backend Team:
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Once backend engineering adds the verification submission and review module in <code className="font-mono text-slate-800">server/src/modules/admin/</code> and <code className="font-mono text-slate-800">server/prisma/schema.prisma</code>, this admin page will be wired directly to the live review endpoints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
