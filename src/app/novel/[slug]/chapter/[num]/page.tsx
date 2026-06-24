import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReaderControls from "./ReaderControls";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function getChapter(slug: string, num: string) {
  const res = await fetch(`${API}/chapters/${slug}/${num}`, { next: { revalidate: 3600 } });
  if (res.status === 404) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string; num: string } }): Promise<Metadata> {
  const ch = await getChapter(params.slug, params.num);
  if (!ch) return { title: "Chapter not found" };
  return {
    title: `Chapter ${ch.chapter_num}${ch.title ? ` — ${ch.title}` : ""} | ${ch.novel_title}`,
  };
}

export default async function ChapterPage({ params }: { params: { slug: string; num: string } }) {
  const chapter = await getChapter(params.slug, params.num);
  if (!chapter) notFound();

  return (
    <div className={styles.page}>
      {/* Sticky reader topbar */}
      <div className={styles.topbar}>
        <Link href={`/novel/${chapter.novel_slug}`} className={styles.novelLink}>
          ← {chapter.novel_title}
        </Link>
        <span className={styles.chapterLabel}>Chapter {chapter.chapter_num}</span>
      </div>

      <div className={styles.wrap}>
        {/* Top ad */}
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Chapter header */}
        <div className={styles.header}>
          <p className={styles.novelSm}>{chapter.novel_title}</p>
          <h1 className={styles.title}>
            Chapter {chapter.chapter_num}
            {chapter.title ? ` — ${chapter.title}` : ""}
          </h1>
          <div className={styles.meta}>
            <span>{chapter.word_count?.toLocaleString()} words</span>
            <span className={styles.dot} />
            <span>~{Math.ceil((chapter.word_count || 1500) / 250)} min read</span>
            <span className={styles.dot} />
            <span>{new Date(chapter.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        {/* Font / size controls — client component */}
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
          {chapter.prev_chapter ? (
            <Link href={`/novel/${chapter.novel_slug}/chapter/${chapter.prev_chapter.chapter_num}`} className={styles.navBtn}>
              ← Ch. {chapter.prev_chapter.chapter_num}
            </Link>
          ) : <span />}

          <Link href={`/novel/${chapter.novel_slug}`} className={styles.navIndex}>Chapter list</Link>

          {chapter.next_chapter ? (
            <Link href={`/novel/${chapter.novel_slug}/chapter/${chapter.next_chapter.chapter_num}`} className={styles.navBtnPrimary}>
              Ch. {chapter.next_chapter.chapter_num} →
            </Link>
          ) : <span className={styles.noMore}>No more chapters yet</span>}
        </div>

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
