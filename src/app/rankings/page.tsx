import RankingsTabs from "./RankingsTabs";
import type { Novel } from "@/types/api";

const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

const TAB_SORTS = ["rating", "views", "new"] as const;

// ─── SEO FIX: server-side fetch ───────────────────────────────────────────────
// The old /rankings page was "use client" and fetched each tab's list inside
// useEffect, so Googlebot's HTML snapshot showed the tab buttons but none of
// the ranked novels — a high-intent landing page indexed with zero content.
//
// Fetch all three tabs (rating / views / new) server-side up front. This
// means every ranking list is present in the initial HTML — not just the
// default "Top rated" tab — so all three views are crawlable, and switching
// tabs client-side afterwards is instant with no extra request.
async function getRankings(sort: string, limit = 20): Promise<Novel[]> {
  try {
    const res = await fetch(`${API}/novels?site=${SITE}&sort=${sort}&limit=${limit}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.novels ?? [];
  } catch {
    return [];
  }
}

export default async function RankingsPage() {
  const results = await Promise.all(TAB_SORTS.map((sort) => getRankings(sort)));

  const initialData: Record<string, Novel[]> = {};
  TAB_SORTS.forEach((sort, i) => {
    initialData[sort] = results[i];
  });

  return <RankingsTabs initialData={initialData} />;
}
