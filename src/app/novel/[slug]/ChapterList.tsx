"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { chaptersApi } from "@/lib/api";
import styles from "./ChapterList.module.css";

interface Props { novelSlug: string; totalChapters: number; }

export default function ChapterList({ novelSlug, totalChapters }: Props) {
  const [chapters, setChapters] = useState<any[]>([]);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    chaptersApi.list(novelSlug, { sort, page, limit })
      .then((d) => setChapters(d.chapters || []))
      .finally(() => setLoading(false));
  }, [novelSlug, sort, page]);

  const totalPages = Math.ceil(totalChapters / limit);

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.title}>Chapters ({totalChapters})</h2>
        <button
          className={styles.sortBtn}
          onClick={() => { setSort(s => s === "asc" ? "desc" : "asc"); setPage(1); }}
        >
          {sort === "desc" ? "Newest first ↓" : "Oldest first ↑"}
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading chapters…</p>
      ) : (
        <div className={styles.list}>
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/novel/${novelSlug}/chapter/${ch.chapter_num}`}
              className={styles.item}
            >
              <div className={styles.left}>
                <span className={styles.num}>Ch. {ch.chapter_num}</span>
                <span className={styles.chTitle}>{ch.title || `Chapter ${ch.chapter_num}`}</span>
              </div>
              <div className={styles.right}>
                <span className={styles.date}>
                  {new Date(ch.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
