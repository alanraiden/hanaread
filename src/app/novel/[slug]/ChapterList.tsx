"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { chaptersApi } from "@/lib/api";
import type { ChapterMeta } from "@/types/api";
import styles from "./ChapterList.module.css";

interface Props {
  novelSlug: string;
  totalChapters: number;
}

export default function ChapterList({ novelSlug, totalChapters }: Props) {
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    chaptersApi.list(novelSlug)
      .then(setChapters)
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [novelSlug]);

  if (loading) return <p>Loading chapters…</p>;
  if (chapters.length === 0) return <p>No chapters yet.</p>;

  return (
    <div className={styles.list}>
      <h2 className={styles.heading}>Chapters ({totalChapters})</h2>
      {chapters.map((ch) => (
        <Link
          key={ch._id}
          href={`/novel/${novelSlug}/chapter/${ch.number}`}
          className={styles.item}
        >
          <span className={styles.num}>Ch. {ch.number}</span>
          <span className={styles.chTitle}>{ch.title || `Chapter ${ch.number}`}</span>
          <span className={styles.date}>
            {new Date(ch.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </Link>
      ))}
    </div>
  );
}
