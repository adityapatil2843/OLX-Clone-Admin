import * as React from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({ onRetry, className }: OfflineStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/60 p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-3">
        <WifiOff className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-amber-950">No Internet Connection</h3>
      <p className="mt-1.5 max-w-sm text-xs text-amber-700 leading-relaxed">
        It looks like you are offline. Check your network connection and click retry.
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-4 border-amber-300 bg-white text-amber-900 hover:bg-amber-100 shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
