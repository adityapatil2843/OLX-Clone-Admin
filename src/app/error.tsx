"use client";

import * as React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors
    console.error("Dashboard caught segment runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-xs">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        {error.message || "An unexpected error occurred while rendering this administration view."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs h-9">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Reload Component
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="text-xs h-9"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
