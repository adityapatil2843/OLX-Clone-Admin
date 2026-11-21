"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  syncWithUrl?: boolean;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 20,
  syncWithUrl = false,
}: UsePaginationOptions = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const clampPage = (p: number) => (Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1);
  const clampLimit = (l: number) => {
    if (!Number.isFinite(l)) return 20;
    const intVal = Math.floor(l);
    return Math.max(1, Math.min(100, intVal));
  };

  const urlPage = syncWithUrl && searchParams?.get("page")
    ? clampPage(parseInt(searchParams.get("page") || "1", 10))
    : clampPage(initialPage);

  const urlLimit = syncWithUrl && searchParams?.get("limit")
    ? clampLimit(parseInt(searchParams.get("limit") || String(initialLimit), 10))
    : clampLimit(initialLimit);

  const [page, setPageState] = React.useState<number>(urlPage);
  const [limit, setLimitState] = React.useState<number>(urlLimit);

  const updateUrl = React.useCallback(
    (newPage: number, newLimit: number) => {
      if (!syncWithUrl || typeof window === "undefined") return;
      const validPage = clampPage(newPage);
      const validLimit = clampLimit(newLimit);
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("page", String(validPage));
      params.set("limit", String(validLimit));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [syncWithUrl, searchParams, router, pathname]
  );

  const setPage = React.useCallback(
    (newPage: number) => {
      const validPage = clampPage(newPage);
      setPageState(validPage);
      updateUrl(validPage, limit);
    },
    [limit, updateUrl]
  );

  const setLimit = React.useCallback(
    (newLimit: number) => {
      const validLimit = clampLimit(newLimit);
      setLimitState(validLimit);
      setPageState(1);
      updateUrl(1, validLimit);
    },
    [updateUrl]
  );

  const resetPage = React.useCallback(() => {
    setPageState(1);
    updateUrl(1, limit);
  }, [limit, updateUrl]);

  return {
    page,
    limit,
    setPage,
    setLimit,
    resetPage,
  };
}
