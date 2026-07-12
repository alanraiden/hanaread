"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAllProgress,
  percentComplete,
  removeProgress,
  type ReadingProgress,
} from "@/lib/reading-progress";
import styles from "./ContinueReading.module.css";

const MAX_SHOWN = 6;

export default function ContinueReading() {
  const [items, setItems] = useState<ReadingProgress[] | null>(null);

  useEffect(() => {
    setItems(getAllProgress().slice(0, MAX_SHOWN));
  }, []);

  const dismiss = (slug: string) => {
    removeProgress(slug);
    setItems((prev) => (prev ? prev.filter((i) => i.slug !== slug) : prev));
  };

  // Nothing tracked yet (or still on the server) — render nothing rather
  // than an empty section.
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Continue reading</h2>
      </div>

      <div className={styles.row}>
        {items.map((item) => {
          const pct = percentComplete(item);
          const nextChapter = item.lastChapterNum + 1;

          return (
            <div key={item.slug} className={styles.card}>
              <button
                type="button"
                className={styles.dismiss}
                aria-label={`Remove ${item.title} from continue reading`}
                onClick={() => dismiss(item.slug)}
              >
                ×
              </button>

              <Link href={`/novel/${item.slug}/chapter/${item.lastChapterNum}`} className={styles.thumbLink}>
                <div className={styles.thumb}>
                  {item.cover ? (
                    <Image src={item.cover} alt={item.title} fill sizes="120px" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>{item.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className={styles.info}>
                <Link href={`/novel/${item.slug}`} className={styles.title}>
                  {item.title}
                </Link>
                <p className={styles.chapterLine}>
                  Ch. {item.lastChapterNum}
                  {item.totalChapters ? ` of ${item.totalChapters}` : ""}
                </p>

                {pct !== null && (
                  <div className={styles.progressTrack} aria-hidden="true">
                    <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                  </div>
                )}

                <Link href={`/novel/${item.slug}/chapter/${nextChapter}`} className={styles.resumeBtn}>
                  {pct !== null ? `Resume · ${pct}%` : "Resume reading"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
