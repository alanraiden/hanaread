import type {
  Novel,
  Chapter,
  ChapterMeta,
  PublicUser,
  AuthMeUser,
  AuthResponse,
  Comment,
  PaginatedNovels,
  PaginatedComments,
  MessageResponse,
  RateResponse,
  LikeResponse,
} from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("hr_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || "Request failed");
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: Record<string, unknown>) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  google: (credential: string) =>
    apiFetch<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  /** Returns the full user document (minus password/googleId) */
  me: () => apiFetch<AuthMeUser>("/auth/me"),
};

// ── Novels ────────────────────────────────────────────────────────────────────
export const novelsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams({ site: SITE, ...params }).toString();
    return apiFetch<PaginatedNovels>(`/novels?${qs}`);
  },

  trending: (limit = 10) =>
    apiFetch<Novel[]>(`/novels/trending?site=${SITE}&limit=${limit}`),

  get: (slug: string) => apiFetch<Novel>(`/novels/${slug}`),

  rate: (slug: string, score: number) =>
    apiFetch<RateResponse>(`/novels/${slug}/rate`, {
      method: "POST",
      body: JSON.stringify({ score }),
    }),
};

// ── Chapters ──────────────────────────────────────────────────────────────────
export const chaptersApi = {
  /** List returns metadata only — no content field */
  list: (novelSlug: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<ChapterMeta[]>(`/chapters/${novelSlug}?${qs}`);
  },

  /** Single chapter fetch includes content */
  get: (novelSlug: string, chapterNum: number | string) =>
    apiFetch<Chapter>(`/chapters/${novelSlug}/${chapterNum}`),

  create: (novelSlug: string, data: Record<string, unknown>) =>
    apiFetch<Chapter>(`/chapters/${novelSlug}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarksApi = {
  /** Returns the user's bookmarked novels (populated from ObjectId refs) */
  list: () => apiFetch<Novel[]>("/users/bookmarks"),

  add: (novelId: string) =>
    apiFetch<MessageResponse>(`/users/bookmarks/${novelId}`, {
      method: "POST",
    }),

  remove: (novelId: string) =>
    apiFetch<MessageResponse>(`/users/bookmarks/${novelId}`, {
      method: "DELETE",
    }),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  query: (q: string, page = 1) => {
    const qs = new URLSearchParams({
      q,
      site: SITE,
      page: String(page),
    }).toString();
    return apiFetch<PaginatedNovels>(`/search?${qs}`);
  },
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<PaginatedComments>(`/comments?${qs}`);
  },

  create: (data: Record<string, unknown>) =>
    apiFetch<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  like: (id: string) =>
    apiFetch<LikeResponse>(`/comments/${id}/like`, { method: "POST" }),

  delete: (id: string) =>
    apiFetch<MessageResponse>(`/comments/${id}`, { method: "DELETE" }),
};

// Re-export all types so components can import from one place
export type {
  Novel,
  Chapter,
  ChapterMeta,
  PublicUser,
  AuthMeUser,
  AuthResponse,
  Comment,
  PaginatedNovels,
  PaginatedComments,
  MessageResponse,
  RateResponse,
  LikeResponse,
};
