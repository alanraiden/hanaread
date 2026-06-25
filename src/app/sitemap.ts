import { MetadataRoute } from "next";

const API      = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:4000/api";
const SITE     = process.env.NEXT_PUBLIC_SITE_ID  || "site1";
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://hanareads.fun").replace(/\/$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

interface NovelSummary {
  slug:         string;
  status:       "ongoing" | "completed";
  chapterCount: number;
  updatedAt:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch every novel from the API, handling pagination automatically.
 * Uses a large page size (100) to minimise the number of round-trips.
 */
async function fetchAllNovels(): Promise<NovelSummary[]> {
  const novels: NovelSummary[] = [];
  let page    = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(
        `${API}/novels?site=${SITE}&sort=new&limit=100&page=${page}`,
        // Revalidate every 12 h so the sitemap stays reasonably fresh
        // without hammering the API on every request.
        { next: { revalidate: 43200 } }
      );
      if (!res.ok) break;

      const data = await res.json();
      const batch: NovelSummary[] = data.novels ?? [];
      novels.push(...batch);

      // Stop when we've consumed all pages, or the batch was empty
      hasMore = page < (data.pages ?? 1) && batch.length > 0;
      page++;
    } catch {
      // Network error — stop pagination gracefully; whatever we have is fine.
      break;
    }
  }

  return novels;
}

// ─── Sitemap export ───────────────────────────────────────────────────────────

/**
 * Next.js App Router sitemap.
 *
 * Generates entries for:
 *   • Static pages  (/, /browse, /rankings)
 *   • Novel pages   (/novel/[slug])
 *   • Chapter pages (/novel/[slug]/chapter/[num])
 *
 * Next.js serves this at /sitemap.xml automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const novels = await fetchAllNovels();

  // ── 1. Static pages ──────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             `${BASE_URL}/`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/browse`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/rankings`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.85,
    },
  ];

  // ── 2. Novel pages (/novel/[slug]) ───────────────────────────────────────
  const novelPages: MetadataRoute.Sitemap = novels.map((novel) => ({
    url:             `${BASE_URL}/novel/${novel.slug}`,
    lastModified:    new Date(novel.updatedAt),
    // Ongoing novels update regularly; completed ones rarely change.
    changeFrequency: novel.status === "ongoing" ? "weekly" : "monthly",
    priority:        0.8,
  }));

  // ── 3. Chapter pages (/novel/[slug]/chapter/[num]) ───────────────────────
  // We already know the total chapter count from the novel record, so we
  // don't need to make a separate API call for each novel's chapter list.
  const chapterPages: MetadataRoute.Sitemap = novels.flatMap((novel) =>
    Array.from({ length: novel.chapterCount ?? 0 }, (_, i) => ({
      url:             `${BASE_URL}/novel/${novel.slug}/chapter/${i + 1}`,
      lastModified:    new Date(novel.updatedAt),
      // Published chapters rarely change content after release.
      changeFrequency: "yearly" as const,
      priority:        0.6,
    }))
  );

  return [...staticPages, ...novelPages, ...chapterPages];
}
