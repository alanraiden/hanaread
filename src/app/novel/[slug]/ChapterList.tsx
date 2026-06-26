"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { chaptersApi } from "@/lib/api";
import styles from "./ChapterList.module.css";

interface Chapter {
  _id: string;
  number: number;
  title?: string;
  createdAt: string;
}

interface Props {
  novelSlug: string;
  totalChapters: number;
  // SSR chapters passed from the server component — when provided, ChapterList
  // uses them as its initial state and skips the client-side fetch entirely,
  // eliminating the "Loading chapters…" flash on first render.
  ssrChapters?: Chapter[];
}

export default function ChapterList({ novelSlug, totalChapters, ssrChapters }: Props) {
  // If the server already fetched chapters, use them immediately — no loading state.
  const [chapters, setChapters] = useState<Chapter[]>(ssrChapters ?? []);
  const [loading, setLoading]   = useState(!ssrChapters || ssrChapters.length === 0);

  useEffect(() => {
    // Skip the fetch if the server already provided chapters.
    if (ssrChapters && ssrChapters.length > 0) return;

    chaptersApi.list(novelSlug)
      .then(setChapters)
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [novelSlug, ssrChapters]);

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
