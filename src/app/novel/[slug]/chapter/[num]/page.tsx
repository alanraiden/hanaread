import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReaderControls from "./ReaderControls";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ─── Static generation ────────────────────────────────────────────────────────
// Fetches every novel's chapter count at build time and returns params for
// every chapter page. Newly published chapters (added after the build) are
// still served on-demand via ISR because dynamicParams defaults to true.

export async function generateStaticParams(): Promise<
  { slug: string; num: string }[]
> {
  const allParams: { slug: string; num: string }[] = [];
  let page    = 1;
  let hasMore = true;

  // Step 1 — collect all novels (paginated)
  const novels: Array<{ slug: string; chapterCount: number }> = [];

  while (hasMore) {
    try {
      const res = await fetch(
        `${API}/novels?site=${SITE}&sort=new&limit=100&page=${page}`,
        { cache: "no-store" }
      );
      if (!res.ok) break;

      const data = await res.json();
      const batch: Array<{ slug: string; chapterCount: number }> =
        data.novels ?? [];

      novels.push(...batch);
      hasMore = page < (data.pages ?? 1) && batch.length > 0;
      page++;
    } catch {
      break;
    }
  }

  // Step 2 — expand each novel into one param object per chapter
  // We already have chapterCount from the list response, so no extra API call
  // is needed per novel.
  for (const novel of novels) {
    const count = novel.chapterCount ?? 0;
    for (let i = 1; i <= count; i++) {
      allParams.push({ slug: novel.slug, num: String(i) });
    }
  }

  return allParams;
}

async function getChapter(slug: string, num: string) {
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { cache: "no-store" });
  if (res.status === 404) return null;
  return res.json();
}

async function getNovel(slug: string) {
  const res = await fetch(`${API}/novels/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function chapterExists(slug: string, num: number) {
  if (num < 1) return false;
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { cache: "no-store" });
  return res.ok;
}

// ─── SEO FIX: Helper — truncate without cutting words ────────────────────────
function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str ?? "";
  return str.slice(0, str.lastIndexOf(" ", maxLen)) + "…";
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; num: string };
}): Promise<Metadata> {
  const [chapter, novel] = await Promise.all([
    getChapter(params.slug, params.num),
    getNovel(params.slug),
  ]);
  if (!chapter) return { title: "Chapter not found" };

  const novelTitle = novel?.title ?? "";

  // SEO FIX: Title pattern "Novel Name Ch.N — Chapter Title"
  // Keep the novel name short so the full title stays under 60 chars.
  // E.g. "My Secret Husband Ch.12 — The Meeting" (38 chars) ✓
  const shortNovelTitle = truncate(novelTitle, 30);
  const chapterPart = chapter.title
    ? `Ch.${chapter.number} — ${truncate(chapter.title, 20)}`
    : `Chapter ${chapter.number}`;
  const seoTitle = `${shortNovelTitle} ${chapterPart}`;

  // SEO FIX: Unique description per chapter.
  // Uses the first sentence of the chapter content as a teaser (~155 chars).
  const firstSentence = chapter.content
    ? truncate(chapter.content.replace(/\n+/g, " ").trim(), 130)
    : null;
  const seoDescription = firstSentence
    ? `${firstSentence} — Read ${novelTitle} Chapter ${chapter.number} on HanaReads.`
    : `Read ${novelTitle} Chapter ${chapter.number} on HanaReads. Free English translation.`;

  return {
    title: seoTitle,
    description: truncate(seoDescription, 155),

    // SEO FIX: Canonical URL for each chapter page
    alternates: {
      canonical: `/novel/${params.slug}/chapter/${params.num}`,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: { slug: string; num: string };
}) {
  const currentNum = Number(params.num);

  const [chapter, novel, hasPrev, hasNext] = await Promise.all([
    getChapter(params.slug, params.num),
    getNovel(params.slug),
    chapterExists(params.slug, currentNum - 1),
    chapterExists(params.slug, currentNum + 1),
  ]);

  if (!chapter) notFound();

  const novelTitle = novel?.title ?? "";
  const novelSlug  = params.slug;

  return (
    <div className={styles.page}>
      {/* Sticky reader topbar */}
      <div className={styles.topbar}>
        <Link href={`/novel/${novelSlug}`} className={styles.novelLink}>
          ← {novelTitle}
        </Link>
        <span className={styles.chapterLabel}>Chapter {chapter.number}</span>
      </div>

      <div className={styles.wrap}>
        {/* Top ad */}
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Chapter header */}
        <div className={styles.header}>
          <p className={styles.novelSm}>{novelTitle}</p>

          {/*
            SEO FIX: Include the NOVEL TITLE in the H1 so every chapter page
            has a UNIQUE H1. Previously "Chapter 1" was duplicated across all
            novels. Now it reads "My Secret Husband — Chapter 1 — The Meeting".
          */}
          <h1 className={styles.title}>
            {novelTitle} — Chapter {chapter.number}
            {chapter.title ? ` — ${chapter.title}` : ""}
          </h1>

          <div className={styles.meta}>
            <span>{chapter.wordCount?.toLocaleString()} words</span>
            <span className={styles.dot} />
            <span>~{Math.ceil((chapter.wordCount || 1500) / 250)} min read</span>
            <span className={styles.dot} />
            <span>
              {new Date(chapter.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Font / size controls */}
        <ReaderControls />

        {/* Chapter body */}
        <div className={styles.body} id="chapter-body">
          {chapter.content.split("\n\n").filter(Boolean).map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Mid ad */}
        <div className={`ad-slot ${styles.adMid}`}>— advertisement —</div>

        {/* SEO FIX: Add h2 for the navigation section */}
        <h2 className="sr-only">Chapter Navigation</h2>

        {/* Prev / Next nav */}
        <div className={styles.chNav}>
          {hasPrev ? (
            <Link href={`/novel/${novelSlug}/chapter/${currentNum - 1}`} className={styles.navBtn}>
              ← Ch. {currentNum - 1}
            </Link>
          ) : <span />}

          <Link href={`/novel/${novelSlug}`} className={styles.navIndex}>Chapter list</Link>

          {hasNext ? (
            <Link href={`/novel/${novelSlug}/chapter/${currentNum + 1}`} className={styles.navBtnPrimary}>
              Ch. {currentNum + 1} →
            </Link>
          ) : (
            <span className={styles.noMore}>No more chapters yet</span>
          )}
        </div>

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
