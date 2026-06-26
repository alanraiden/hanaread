import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ChapterList from "./ChapterList";
import BookmarkBtn from "./BookmarkBtn";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ─── Static generation ────────────────────────────────────────────────────────
// Return empty array — novel pages are served on-demand via ISR.
// Attempting to pre-render all novels at build time causes parallel API calls
// that trigger rate-limiting (HTTP 429) on the EC2 backend, crashing the build.
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return [];
}

async function getNovel(slug: string) {
  const res = await fetch(`${API}/novels/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  try { return await res.json(); } catch { return null; }
}

// Fetch all chapters for a novel — used for SSR chapter links so Googlebot
// can crawl every chapter page from the novel page.
async function getChapters(novelId: string): Promise<Array<{ _id: string; number: number; title: string }>> {
  try {
    const res = await fetch(`${API}/chapters/${novelId}?sort=asc&limit=1000`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // API may return { chapters: [...] } or a plain array
    return data.chapters ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const novel = await getNovel(params.slug);
  if (!novel) return { title: "Novel not found" };

  // Use the full novel title — never truncate in the <title> tag.
  // Google handles display truncation in SERPs; adding "…" ourselves wastes
  // characters that could match search queries.
  const seoTitle = `${novel.title} | HanaReads`;

  const seoDescription = novel.description
    ? novel.description.replace(/\n+/g, " ").trim().slice(0, 155)
    : `Read ${novel.title} — a Korean novel in English on HanaReads. ${novel.chapterCount ?? 0} chapters available.`;

  return {
    // Use title.absolute so the layout template does not append "| HanaReads"
    // a second time (which would produce "Novel Title | HanaReads | HanaReads").
    title: { absolute: seoTitle },
    description: seoDescription,

    alternates: {
      canonical: `/novel/${params.slug}`,
    },

    openGraph: {
      title: novel.title,
      description: seoDescription,
      url: `https://hanareads.fun/novel/${params.slug}`,
      type: "book",
      siteName: "HanaReads",
      images: novel.cover
        ? [{ url: novel.cover, width: 170, height: 255, alt: novel.title }]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: novel.title,
      description: seoDescription,
      images: novel.cover ? [novel.cover] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function NovelPage({ params }: { params: { slug: string } }) {
  const novel = await getNovel(params.slug);
  if (!novel) notFound();

  // Fetch chapters server-side so they are present in the HTML for Googlebot.
  // Without this the chapter list is client-rendered and Googlebot sees only
  // "Loading chapters…" — meaning none of the chapter pages get crawled or
  // linked from the novel page.
  const ssrChapters = await getChapters(novel._id);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>›</span>
          {novel.genres?.[0] && (
            <Link href={`/browse?genre=${novel.genres[0]}`}>{novel.genres[0]}</Link>
          )}
          {novel.genres?.[0] && <span>›</span>}
          <span>{novel.title}</span>
        </nav>

        {/* Top ad */}
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Hero row */}
        <div className={styles.heroRow}>
          <div className={styles.coverWrap}>
            {novel.cover ? (
              <Image
                src={novel.cover}
                alt={`${novel.title} cover`}
                width={170}
                height={255}
                className={styles.cover}
                priority
              />
            ) : (
              <div className={styles.coverPlaceholder}>
                {novel.title.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className={`${styles.statusBadge} ${styles[novel.status]}`}>
              {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
            </span>
          </div>

          <div className={styles.info}>
            <h1 className={styles.title}>{novel.title}</h1>
            <p className={styles.author}>
              by <span>{novel.author || "Unknown"}</span>
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>★ {Number(novel.rating).toFixed(1)}</span>
                <span className={styles.statLbl}>Rating</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{novel.chapterCount ?? 0}</span>
                <span className={styles.statLbl}>Chapters</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{(novel.views / 1000).toFixed(1)}k</span>
                <span className={styles.statLbl}>Views</span>
              </div>
            </div>

            <div className={styles.tags}>
              {(novel.genres || []).map((g: string) => (
                <Link key={g} href={`/browse?genre=${g}`} className={styles.tag}>{g}</Link>
              ))}
            </div>

            <div className={styles.actions}>
              <Link href={`/novel/${novel.slug}/chapter/1`} className={styles.btnRead}>
                Read from Chapter 1
              </Link>
              <BookmarkBtn novelId={novel._id} initialBookmarked={false} />
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Synopsis</h2>
          <p className={styles.synopsis}>{novel.description}</p>
        </section>

        {/* Chapters
            SSR layer: a plain <ul> of chapter links rendered in the server HTML.
            Googlebot reads this and can crawl every chapter page.
            ChapterList renders on top of this with interactive features
            (search, pagination, etc.) — it should hide this list once mounted
            to avoid duplication, or you can pass ssrChapters as a prop so
            ChapterList uses them as its initial state with no loading spinner. */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Chapters</h2>

          {ssrChapters.length > 0 ? (
            <>
              {/* SEO: server-rendered chapter links visible to Googlebot */}
              <ul className={styles.ssrChapterList}>
                {ssrChapters.map((ch) => (
                  <li key={ch._id}>
                    <Link href={`/novel/${novel.slug}/chapter/${ch.number}`}>
                      Chapter {ch.number}{ch.title && !/^chapter\s*\d+$/i.test(ch.title.trim()) ? ` — ${ch.title}` : ""}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Interactive chapter list — receives SSR chapters so it can
                  render immediately without a loading state. Update ChapterList
                  to accept and use ssrChapters as its initial chapters prop. */}
              <ChapterList
                novelSlug={novel.slug}
                totalChapters={novel.chapterCount ?? 0}
                ssrChapters={ssrChapters}
              />
            </>
          ) : (
            // Fallback if chapter fetch failed — ChapterList handles its own fetch
            <ChapterList
              novelSlug={novel.slug}
              totalChapters={novel.chapterCount ?? 0}
            />
          )}
        </section>

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
