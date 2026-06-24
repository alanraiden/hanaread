const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = typeof window !== "undefined" ? localStorage.getItem("hr_token") : null;

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

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: Record<string, unknown>) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiFetch("/auth/me"),
};

// ── Novels ────────────────────────────────────────────────────────────────────
export const novelsApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams({ site: SITE, ...params }).toString();
    return apiFetch(`/novels?${qs}`);
  },

  trending: (limit = 10) =>
    apiFetch(`/novels/trending?site=${SITE}&limit=${limit}`),

  get: (slug: string) => apiFetch(`/novels/${slug}`),

  rate: (slug: string, score: number) =>
    apiFetch(`/novels/${slug}/rate`, { method: "POST", body: JSON.stringify({ score }) }),
};

// ── Chapters ──────────────────────────────────────────────────────────────────
export const chaptersApi = {
  list: (novelSlug: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/chapters/${novelSlug}?${qs}`);
  },

  get: (novelSlug: string, chapterNum: number | string) =>
    apiFetch(`/chapters/${novelSlug}/${chapterNum}`),

  create: (novelSlug: string, data: Record<string, unknown>) =>
    apiFetch(`/chapters/${novelSlug}`, { method: "POST", body: JSON.stringify(data) }),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarksApi = {
  list: () => apiFetch("/users/bookmarks"),
  add: (novelId: string) =>
    apiFetch(`/users/bookmarks/${novelId}`, { method: "POST" }),
  remove: (novelId: string) =>
    apiFetch(`/users/bookmarks/${novelId}`, { method: "DELETE" }),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  query: (q: string, page = 1) => {
    const qs = new URLSearchParams({ q, site: SITE, page: String(page) }).toString();
    return apiFetch(`/search?${qs}`);
  },
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/comments?${qs}`);
  },
  create: (data: Record<string, unknown>) =>
    apiFetch("/comments", { method: "POST", body: JSON.stringify(data) }),
  like: (id: string) =>
    apiFetch(`/comments/${id}/like`, { method: "POST" }),
  delete: (id: string) =>
    apiFetch(`/comments/${id}`, { method: "DELETE" }),
};
