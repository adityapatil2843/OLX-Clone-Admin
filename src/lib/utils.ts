import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow as dateFnsDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
}

export function formatDate(date: string | Date | number, formatStr: string = "dd MMM yyyy, hh:mm a"): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return format(d, formatStr);
  } catch {
    return String(date);
  }
}

export function formatRelativeTime(date: string | Date | number): string {
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    return dateFnsDistanceToNow(d, { addSuffix: true });
  } catch {
    return String(date);
  }
}
