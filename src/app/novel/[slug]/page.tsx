import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ChapterList from "./ChapterList";
import BookmarkBtn from "./BookmarkBtn";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function getNovel(slug: string) {
  const res = await fetch(`${API}/novels/${slug}`, { next: { revalidate: 600 } });
  if (res.status === 404) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const novel = await getNovel(params.slug);
  if (!novel) return { title: "Novel not found" };
  return {
    title: novel.title,
    description: novel.synopsis?.slice(0, 160),
    openGraph: {
      title: novel.title,
      description: novel.synopsis?.slice(0, 160),
      images: novel.cover_url ? [novel.cover_url] : [],
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
            {novel.cover_url ? (
              <Image
                src={novel.cover_url}
                alt={novel.title}
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
            {novel.original_title && (
              <p className={styles.originalTitle}>{novel.original_title}</p>
            )}
            <p className={styles.author}>
              by <span>{novel.author || "Unknown"}</span>
              {novel.translator && <> · Translated by {novel.translator}</>}
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>★ {Number(novel.avg_rating).toFixed(1)}</span>
                <span className={styles.statLbl}>Rating</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{novel.chapter_count ?? 0}</span>
                <span className={styles.statLbl}>Chapters</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{(novel.view_count / 1000).toFixed(0)}k</span>
                <span className={styles.statLbl}>Views</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{(novel.bookmark_count / 1000).toFixed(1)}k</span>
                <span className={styles.statLbl}>Bookmarks</span>
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
              <BookmarkBtn novelId={novel.id} initialBookmarked={novel.bookmarked} />
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Synopsis</h2>
          <p className={styles.synopsis}>{novel.synopsis}</p>
        </section>

        {/* Chapters */}
        <section className={styles.section}>
          <ChapterList novelSlug={novel.slug} totalChapters={novel.chapter_count ?? 0} />
        </section>

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
