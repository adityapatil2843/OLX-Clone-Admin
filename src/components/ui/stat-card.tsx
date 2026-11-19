import * as React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  label?: string;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  label,
  icon: Icon,
  iconColor = "text-sky-600 bg-sky-50 border-sky-100",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={cn("rounded-lg p-2.5 border", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <h4 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h4>
        {(change || label) && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold",
                  isPositive ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {change}
              </span>
            )}
            {label && <span>{label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
