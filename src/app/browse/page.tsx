import { Suspense } from "react";
import BrowseFilters from "./BrowseFilters";
import type { Novel } from "@/types/api";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ─── SEO FIX: server-side fetch ───────────────────────────────────────────────
// The old /browse page was "use client" and fetched novels inside useEffect,
// so Googlebot's HTML snapshot only ever contained a "Loading…" skeleton —
// the entire catalog was invisible to search engines.
//
// This fetches the first page of results on the server (honouring any
// ?sort=/?status=/?genre= query params already on the URL, e.g. links from
// /novel/[slug] tag pills like /browse?genre=Fantasy) so the initial HTML
// response already contains real novel cards. The client component
// (BrowseFilters) then takes over for interactive re-filtering/sorting/
// pagination without needing another request on first load.
async function getNovels(searchParams: {
  [key: string]: string | string[] | undefined;
}): Promise<{ novels: Novel[]; total: number }> {
  const q      = typeof searchParams.q      === "string" ? searchParams.q.trim() : "";
  const sort   = typeof searchParams.sort   === "string" ? searchParams.sort   : "views";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const genre  = typeof searchParams.genre  === "string" ? searchParams.genre  : "";

  // A search term takes over completely — it hits the dedicated /search
  // endpoint (same one the navbar autocomplete uses), which isn't aware of
  // sort/status/genre, rather than the generic /novels listing endpoint
  // which has no title-search support at all.
  if (q) {
    try {
      const qs = new URLSearchParams({ q, site: SITE, page: "1", limit: "24" }).toString();
      const res = await fetch(`${API}/search?${qs}`, { next: { revalidate: 60 } });
      if (!res.ok) return { novels: [], total: 0 };
      const data = await res.json();
      const novels: Novel[] = data.novels ?? data.results ?? [];
      return { novels, total: data.total ?? novels.length };
    } catch {
      return { novels: [], total: 0 };
    }
  }

  const params: Record<string, string> = { site: SITE, sort, page: "1", limit: "24" };
  if (status) params.status = status;
  if (genre)  params.genre  = genre;

  const qs = new URLSearchParams(params).toString();

  try {
    const res = await fetch(`${API}/novels?${qs}`, { next: { revalidate: 300 } });
    if (!res.ok) return { novels: [], total: 0 };
    const data = await res.json();
    return { novels: data.novels ?? [], total: data.total ?? 0 };
  } catch {
    return { novels: [], total: 0 };
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { novels, total } = await getNovels(searchParams);
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  return (
    <Suspense fallback={<div className={styles.page} style={{ padding: "2rem" }}>Loading…</div>}>
      <BrowseFilters initialNovels={novels} initialTotal={total} initialQuery={q} />
    </Suspense>
  );
}
