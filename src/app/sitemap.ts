import { SIMILAR_SLUGS } from './novels-like/data';
import { BEST_LIST_SLUGS } from './best/data';

const BASE = 'https://hanareads.fun';
const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Harem','Historical','Horror','Isekai','Josei','Martial Arts','Mecha','Mystery','Psychological','Romance','School Life','Sci-Fi','Slice of Life','Sports','Supernatural','System','Tragedy','Wuxia','Xianxia','Xuanhuan'];

const PER_FILE = 40000; // stay safely under Google's 50k limit per file

export const revalidate = 86400; // 24h; call revalidatePath('/sitemap.xml') for instant refresh after edits

// ---- shared data fetch, reused by both generateSitemaps() and sitemap() ----
async function getAllUrls() {
  const staticPages = [
    { url: BASE,               changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/browse`,   changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/rankings`, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/genres`,   changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/updates`,  changeFrequency: 'daily',   priority: 0.8 },
  ];

  const novelsLikePages = SIMILAR_SLUGS.map(slug => ({
    url: `${BASE}/novels-like/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const bestOfPages = BEST_LIST_SLUGS.map(slug => ({
    url: `${BASE}/best/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  const genrePages = GENRES.map(g => ({
    url: `${BASE}/genre/${g.toLowerCase().replace(/\s+/g, '-')}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  try {
    const res = await fetch(`${API}/novels?limit=1000&sort=new`);
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    const validNovels = (data.novels || []).filter(n => n.slug);

    const novelPages = validNovels.map(n => ({
      url: `${BASE}/novel/s/${n.slug}`,
      lastModified: n.updatedAt ? new Date(n.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    const chapterPages = [];
    for (const novel of validNovels.filter(n => n.chapterCount > 0)) {
      for (let i = 1; i <= novel.chapterCount; i++) {
        chapterPages.push({
          url: `${BASE}/novel/s/${novel.slug}/chapter-${i}`,
          lastModified: novel.updatedAt ? new Date(novel.updatedAt) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }

    return [...staticPages, ...novelsLikePages, ...bestOfPages, ...genrePages, ...novelPages, ...chapterPages];
  } catch (err) {
    console.error('SITEMAP FETCH FAILED:', err.message);
    // fall back to static-only so the sitemap never fully breaks if the API hiccups
    return [...staticPages, ...novelsLikePages, ...bestOfPages, ...genrePages];
  }
}

// Splits the full URL list into chunks of PER_FILE.
// If total URLs <= PER_FILE, this returns a single id: sitemap.xml stays one file.
// If it grows past that, Next.js automatically serves /sitemap/0.xml, /sitemap/1.xml, etc.,
// and /sitemap.xml becomes the index referencing them — no code changes needed later.
export async function generateSitemaps() {
  const all = await getAllUrls();
  const count = Math.max(1, Math.ceil(all.length / PER_FILE));
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }) {
  const all = await getAllUrls();
  const start = id * PER_FILE;
  const end = start + PER_FILE;
  return all.slice(start, end);
}
