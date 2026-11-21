import type { AdminPageMeta } from "@/features/shared/types";

export type { AdminPageMeta };

export interface ApiResponseEnvelope<T> {
  data: T;
  meta?: AdminPageMeta;
}

export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

const DEFAULT_BASE_URL = "https://olx-clone-server-zngq.onrender.com/api/v1";

export function getAdminBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
  return (envUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("admin_access_token");
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("admin_access_token", token);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("admin_access_token");
}

async function executeRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; meta?: AdminPageMeta; raw: Response }> {
  const { timeoutMs = 15000, skipAuth = false, headers, ...restInit } = options;
  const baseUrl = getAdminBaseUrl();
  const token = !skipAuth ? getAdminToken() : null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((headers as Record<string, string>) || {}),
  };

  try {
    const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...restInit,
      headers: finalHeaders,
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      data?: T;
      meta?: AdminPageMeta;
      error?: ApiErrorPayload;
      message?: string;
    };

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        clearAdminToken();
        window.dispatchEvent(new CustomEvent("admin:unauthorized"));
      }
    }

    if (!response.ok || body.success === false) {
      const errorMsg =
        body.error?.message ||
        body.message ||
        `Admin API request failed with status ${response.status}`;
      throw new ApiClientError(errorMsg, response.status, body.error);
    }

    return {
      data: (body.data !== undefined ? body.data : body) as T,
      meta: body.meta,
      raw: response,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError("Request timeout. Server took too long to respond.", 408);
    }
    const message = err instanceof Error ? err.message : "Network error or server unreachable";
    throw new ApiClientError(message, 0);
  }
}

export const apiClient = {
  get: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const res = await executeRequest<T>(path, { ...options, method: "GET" });
    return res.data;
  },

  getWithMeta: async <T>(path: string, options?: RequestOptions): Promise<ApiResponseEnvelope<T>> => {
    const res = await executeRequest<T>(path, { ...options, method: "GET" });
    return {
      data: (res.data || []) as T,
      meta: res.meta || {
        page: 1,
        limit: 20,
        total: Array.isArray(res.data) ? res.data.length : 0,
        totalPages: 1,
      },
    };
  },

  post: async <T, B = unknown>(path: string, body?: B, options?: RequestOptions): Promise<T> => {
    const res = await executeRequest<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.data;
  },

  patch: async <T, B = unknown>(path: string, body?: B, options?: RequestOptions): Promise<T> => {
    const res = await executeRequest<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.data;
  },

  delete: async <T>(path: string, options?: RequestOptions): Promise<T> => {
    const res = await executeRequest<T>(path, { ...options, method: "DELETE" });
    return res.data;
  },
};
