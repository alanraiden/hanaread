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
// At build time Next.js calls this function, pre-renders a page for every slug
// it returns, and stores the HTML. New slugs added after the build are still
// handled on-demand (dynamicParams defaults to true) and cached via ISR.

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs: { slug: string }[] = [];
  let page    = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const res = await fetch(
        `${API}/novels?site=${SITE}&sort=new&limit=100&page=${page}`,
        { cache: "no-store" }
      );
      if (!res.ok) break;

      const data = await res.json();
      const batch: Array<{ slug: string }> = data.novels ?? [];

      slugs.push(...batch.map((n) => ({ slug: n.slug })));

      hasMore = page < (data.pages ?? 1) && batch.length > 0;
      page++;
    } catch {
      break; // Network error during build — skip remaining pages gracefully
    }
  }

  return slugs;
}

async function getNovel(slug: string) {
  const res = await fetch(`${API}/novels/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  return res.json();
}

// ─── SEO FIX: Helper — truncate a string to maxLen chars without cutting words ─
function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str ?? "";
  return str.slice(0, str.lastIndexOf(" ", maxLen)) + "…";
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const novel = await getNovel(params.slug);
  if (!novel) return { title: "Novel not found" };

  // SEO FIX: Keep title under ~50 chars so "Title | HanaReads" fits in 60 chars total.
  // "| HanaReads" = 12 chars, so novel title should be ≤ 48 chars.
  const seoTitle = truncate(novel.title, 48);

  // SEO FIX: Unique description per novel — first 155 chars of the synopsis.
  // 155 chars keeps it within Google's snippet display limit.
  const seoDescription = novel.description
    ? truncate(novel.description, 155)
    : `Read ${novel.title} — a Korean romance novel in English on HanaReads. ${novel.chapterCount ?? 0} chapters available.`;

  return {
    // SEO FIX: Short, unique title
    title: seoTitle,

    // SEO FIX: Unique description per novel
    description: seoDescription,

    // SEO FIX: Canonical URL — prevents duplicate content if the novel
    // is accessible from multiple URLs (e.g. with/without trailing slash)
    alternates: {
      canonical: `/novel/${params.slug}`,
    },

    openGraph: {
      title: novel.title,
      description: seoDescription,
      images: novel.cover ? [{ url: novel.cover, width: 170, height: 255, alt: novel.title }] : [],
    },
  };
}

export default async function NovelPage({ params }: { params: { slug: string } }) {
  const novel = await getNovel(params.slug);
  if (!novel) notFound();

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>›</span>
          {novel.genres?.[0] && <Link href={`/browse?genre=${novel.genres[0]}`}>{novel.genres[0]}</Link>}
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
            {/* SEO FIX: h1 is the full novel title (unique per page — good!) */}
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

        {/* Description */}
        <section className={styles.section}>
          {/* SEO FIX: "Synopsis" is a good, descriptive h2 */}
          <h2 className={styles.sectionTitle}>Synopsis</h2>
          <p className={styles.synopsis}>{novel.description}</p>
        </section>

        {/* Chapters */}
        <section className={styles.section}>
          {/* SEO FIX: Add an h2 for the chapter list section */}
          <h2 className={styles.sectionTitle}>Chapters</h2>
          <ChapterList novelSlug={novel.slug} totalChapters={novel.chapterCount ?? 0} />
        </section>

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
