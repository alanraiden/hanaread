import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReaderControls from "./ReaderControls";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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

// Check if an adjacent chapter exists
async function chapterExists(slug: string, num: number) {
  if (num < 1) return false;
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { cache: "no-store" });
  return res.ok;
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
  return {
    title: `Chapter ${chapter.number}${chapter.title ? ` — ${chapter.title}` : ""} | ${novel?.title ?? ""}`,
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
          <h1 className={styles.title}>
            Chapter {chapter.number}
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
