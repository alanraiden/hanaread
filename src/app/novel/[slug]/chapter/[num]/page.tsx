import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReaderControls from "./ReaderControls";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

// ─── Static generation ────────────────────────────────────────────────────────
export async function generateStaticParams(): Promise<
  { slug: string; num: string }[]
> {
  const allParams: { slug: string; num: string }[] = [];
  let page    = 1;
  let hasMore = true;

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

  for (const novel of novels) {
    const count = novel.chapterCount ?? 0;
    for (let i = 1; i <= count; i++) {
      allParams.push({ slug: novel.slug, num: String(i) });
    }
  }

  return allParams;
}

async function getChapter(slug: string, num: string) {
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { next: { revalidate: 3600 } });
  if (res.status === 404) return null;
  return res.json();
}

async function getNovel(slug: string) {
  const res = await fetch(`${API}/novels/${slug}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

async function chapterExists(slug: string, num: number) {
  if (num < 1) return false;
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { next: { revalidate: 3600 } });
  return res.ok;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str: string, maxLen: number): string {
  if (!str || str.length <= maxLen) return str ?? "";
  return str.slice(0, str.lastIndexOf(" ", maxLen)) + "…";
}

/**
 * FIX 1 — Returns true only when chapter.title is a real descriptive title,
 * not the generic "Chapter N" / "Chapter N. Some Title" pattern that many
 * scrapers store as the title.  Those generic labels caused the H1 and
 * <title> to read "…Chapter 12 — Chapter 12".
 */
function isRealTitle(title: string | undefined | null): boolean {
  if (!title || !title.trim()) return false;
  // Matches: "Chapter 12", "Chapter 12.", "chapter 12 — foo", "Ch. 12" etc.
  return !/^ch(apter)?\.?\s*\d+/i.test(title.trim());
}

/**
 * FIX 2 — Extracts the first real prose paragraph from chapter content.
 * Skips short header lines, "Chapter N" labels, and abbreviation headers
 * like "HHLWMBW — Chapter 12" that scrapers prepend to the content.
 */
function firstProseParagraph(content: string | undefined | null): string | null {
  if (!content) return null;
  return (
    content
      .split(/\n+/)
      .map((p) => p.trim())
      .find(
        (p) =>
          p.length > 80 &&
          !/^ch(apter)?\.?\s*\d+/i.test(p) &&   // skip "Chapter 12" lines
          !/^[A-Z]{3,10}\s*[—-]/.test(p)         // skip "HHLWMBW —" abbreviations
      ) ?? null
  );
}

/**
 * FIX 5 — Splits chapter content into paragraphs regardless of whether the
 * scraper stored them with double newlines (\n\n) or single newlines (\n).
 *
 * Root cause: different source sites / scrapers normalise line breaks
 * differently.  Novels from some sources land in the DB with \n\n between
 * paragraphs (current split works fine); others use a single \n so the old
 * split('\n\n') returned one giant string and everything collapsed into one
 * <p> block.
 *
 * Strategy:
 *   - If the content already has \n\n, trust those as paragraph boundaries.
 *   - Otherwise fall back to \n as the separator.
 * This avoids over-splitting well-formatted content while fixing the
 * single-newline novels.
 */
/**
 * FIX 5 — Converts raw chapter content into safe HTML paragraphs.
 * Mirrors idenwebstudio's formatContent exactly.
 *
 * Root cause: HTML silently collapses \n whitespace, so dialogue lines
 * separated by a single \n all merged into one unbroken wall of text.
 * idenwebstudio avoids this by converting inner \n to <br/> after splitting
 * on \n\n — HanaReads was only splitting, not handling inner newlines.
 *
 * Strategy:
 *   1. Split on \n\n+ (or \n if no double newlines) to get paragraphs.
 *   2. Within each paragraph replace remaining \n with <br/> so dialogue
 *      lines on single newlines still render on separate lines.
 *   3. Return as HTML string for dangerouslySetInnerHTML.
 *
 * Content is from our own DB (no user input) so dangerouslySetInnerHTML
 * is safe — same pattern idenwebstudio already uses.
 */
function formatContent(content: string): string {
  if (!content) return "";
  const separator = content.includes("\n\n") ? /\n\n+/ : /\n/;
  return content
    .split(separator)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

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

  // FIX 2 — Build chapter label; only append chapter.title when it's a real
  // descriptive title, not a generic "Chapter N" repeat.
  const realTitle = isRealTitle(chapter.title);
  const chapterLabel = realTitle
    ? `Chapter ${chapter.number} — ${chapter.title}`
    : `Chapter ${chapter.number}`;

  // FIX 2 — Keep full novel title; only truncate if the combined string
  // exceeds the 65-char SERP budget.
  const fullSeoTitle = `${novelTitle} ${chapterLabel} | HanaReads`;
  const seoTitle =
    fullSeoTitle.length <= 65
      ? fullSeoTitle
      : `${truncate(novelTitle, 65 - chapterLabel.length - 12)} ${chapterLabel} | HanaReads`;

  // FIX 3 — Pull description from the first real prose paragraph, not the
  // raw content start which may contain junk header lines.
  const teaser = firstProseParagraph(chapter.content);
  const seoDescription = teaser
    ? `${truncate(teaser, 120)} — Read ${novelTitle} Chapter ${chapter.number} on HanaReads.`
    : `Read ${novelTitle} Chapter ${chapter.number} on HanaReads. Free English translation.`;

  const canonicalUrl = `https://hanareads.fun/novel/${params.slug}/chapter/${params.num}`;

  return {
    title: seoTitle,
    description: truncate(seoDescription, 155),

    alternates: {
      canonical: canonicalUrl,
    },

    // FIX 4 — Add per-chapter OG + Twitter tags so shared links show the
    // chapter title instead of the generic "HanaReads" homepage fallback.
    openGraph: {
      title: seoTitle,
      description: truncate(seoDescription, 155),
      url: canonicalUrl,
      type: "article",
      siteName: "HanaReads",
    },
    twitter: {
      card: "summary",
      title: seoTitle,
      description: truncate(seoDescription, 155),
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // FIX 1 — Only show chapter.title in the H1 when it's a real descriptive
  // title; prevents "Novel Name — Chapter 12 — Chapter 12" duplication.
  const realTitle = isRealTitle(chapter.title);

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

          {/* FIX 1 — H1 no longer duplicates "Chapter N" when chapter.title
              is just a generic "Chapter N" label from the scraper. */}
          <h1 className={styles.title}>
            {novelTitle} — Chapter {chapter.number}
            {realTitle ? ` — ${chapter.title}` : ""}
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

        {/* Chapter body — dangerouslySetInnerHTML is safe here because
            content comes from our own DB, not user input. This mirrors
            idenwebstudio's approach and is required so inner \n renders
            as <br/> instead of being collapsed by HTML whitespace rules. */}
        <div
          className={styles.body}
          id="chapter-body"
          dangerouslySetInnerHTML={{ __html: formatContent(chapter.content) }}
        />

        {/* Mid ad */}
        <div className={`ad-slot ${styles.adMid}`}>— advertisement —</div>

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
