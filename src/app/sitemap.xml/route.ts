// app/sitemap.xml/route.ts
//
// WHY a Route Handler instead of sitemap.ts (MetadataRoute)?
// ─────────────────────────────────────────────────────────────
// MetadataRoute sitemaps go through Next.js's RSC pipeline, which
// injects  `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`
// on the response. Google's sitemap crawler does not send those
// headers, so it may hit a different cache variant (or a cold-start
// MISS) and receive a JSON RSC payload instead of XML — causing
// "Sitemap could not be read" even though curl returns 200 XML.
//
// A plain Route Handler is completely outside the RSC pipeline:
//   • No Vary headers
//   • Explicit Content-Type: application/xml; charset=utf-8
//   • Route-level revalidate (ISR) so the first hit is always cached
//   • Full control over Cache-Control

const API      = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:4000/api";
const SITE     = process.env.NEXT_PUBLIC_SITE_ID  || "site1";
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://hanareads.fun").replace(/\/$/, "");

// ─── Route-level cache config ──────────────────────────────────────────────
// Vercel/Next.js will build + cache this response for 12 h, then
// regenerate in the background (stale-while-revalidate).
// This means the cold-start API pagination only runs once per 12 h,
// not on every Googlebot request.
export const revalidate = 43200; // 12 hours

// ─── Types ────────────────────────────────────────────────────────────────────

interface NovelSummary {
  slug:         string;
  status:       "ongoing" | "completed";
  chapterCount: number;
  updatedAt:    string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchAllNovels(): Promise<NovelSummary[]> {
  const novels: NovelSummary[] = [];
  let page    = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(
        `${API}/novels?site=${SITE}&sort=new&limit=100&page=${page}`,
        // Per-fetch cache tag still applies within the route's revalidation window.
        { next: { revalidate: 43200 } }
      );
      if (!res.ok) break;

      const data = await res.json();
      const batch: NovelSummary[] = data.novels ?? [];
      novels.push(...batch);

      hasMore = page < (data.pages ?? 1) && batch.length > 0;
      page++;
    } catch {
      break;
    }
  }

  return novels;
}

/** Escape the five XML special characters so URLs are safe in <loc> tags. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&apos;");
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  const novels = await fetchAllNovels();

  // 1. Static pages
  const staticUrls = [
    { url: `${BASE_URL}/`,         changefreq: "daily",   priority: "1.0" },
    { url: `${BASE_URL}/browse`,   changefreq: "daily",   priority: "0.9" },
    { url: `${BASE_URL}/rankings`, changefreq: "daily",   priority: "0.85" },
  ].map((u) => ({ ...u, lastmod: new Date().toISOString() }));

  // 2. Novel pages
  const novelUrls = novels.map((n) => ({
    url:        `${BASE_URL}/novel/${n.slug}`,
    lastmod:    new Date(n.updatedAt).toISOString(),
    changefreq: n.status === "ongoing" ? "weekly" : "monthly",
    priority:   "0.8",
  }));

  // 3. Chapter pages — derived from chapterCount, no extra API calls needed
  const chapterUrls = novels.flatMap((n) =>
    Array.from({ length: n.chapterCount ?? 0 }, (_, i) => ({
      url:        `${BASE_URL}/novel/${n.slug}/chapter/${i + 1}`,
      lastmod:    new Date(n.updatedAt).toISOString(),
      changefreq: "yearly",
      priority:   "0.6",
    }))
  );

  const allUrls = [...staticUrls, ...novelUrls, ...chapterUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.url)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      // Explicit charset removes any encoding ambiguity for Google's XML parser.
      "Content-Type":  "application/xml; charset=utf-8",
      // Public CDN-cacheable. max-age=0 forces revalidation but stale-while-revalidate
      // means Vercel/Cloudflare will serve the cached copy while regenerating in the bg.
      "Cache-Control": "public, max-age=0, s-maxage=43200, stale-while-revalidate=86400",
    },
  });
}
