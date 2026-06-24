const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("hr_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => apiFetch("/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  me:       ()     => apiFetch("/auth/me"),
};

// ── Novels ────────────────────────────────────────────────────────────────────
export const novelsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams({ site: SITE, ...params }).toString();
    return apiFetch(`/novels?${qs}`);
  },

  trending: (limit = 10) =>
    apiFetch(`/novels/trending?site=${SITE}&limit=${limit}`),

  get: (slug) => apiFetch(`/novels/${slug}`),

  rate: (slug, score) =>
    apiFetch(`/novels/${slug}/rate`, { method: "POST", body: JSON.stringify({ score }) }),
};

// ── Chapters ──────────────────────────────────────────────────────────────────
export const chaptersApi = {
  list: (novelSlug, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/chapters/${novelSlug}?${qs}`);
  },

  get: (novelSlug, chapterNum) =>
    apiFetch(`/chapters/${novelSlug}/${chapterNum}`),

  create: (novelSlug, data) =>
    apiFetch(`/chapters/${novelSlug}`, { method: "POST", body: JSON.stringify(data) }),
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarksApi = {
  list:   ()        => apiFetch("/users/bookmarks"),
  add:    (novelId) => apiFetch(`/users/bookmarks/${novelId}`, { method: "POST" }),
  remove: (novelId) => apiFetch(`/users/bookmarks/${novelId}`, { method: "DELETE" }),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  query: (q, page = 1) => {
    const qs = new URLSearchParams({ q, site: SITE, page }).toString();
    return apiFetch(`/search?${qs}`);
  },
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (params) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/comments?${qs}`);
  },
  create: (data) => apiFetch("/comments", { method: "POST", body: JSON.stringify(data) }),
  like:   (id)   => apiFetch(`/comments/${id}/like`, { method: "POST" }),
  delete: (id)   => apiFetch(`/comments/${id}`, { method: "DELETE" }),
};
