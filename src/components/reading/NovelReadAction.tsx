"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress, percentComplete, type ReadingProgress } from "@/lib/reading-progress";

interface Props {
  slug: string;
  /** Class name from the page's own CSS module, so the button matches its styling */
  className: string;
}

/**
 * Renders "Read from Chapter 1" for new readers, or "Continue Ch. N" (with
 * a % complete) once local progress exists for this novel. Client-only
 * since it depends on localStorage; falls back to the chapter-1 link
 * during SSR/first paint to avoid layout shift.
 */
export default function NovelReadAction({ slug, className }: Props) {
  const [progress, setProgress] = useState<ReadingProgress | null | undefined>(undefined);

  useEffect(() => {
    setProgress(getProgress(slug));
  }, [slug]);

  if (!progress) {
    return (
      <Link href={`/novel/${slug}/chapter/1`} className={className}>
        Read from Chapter 1
      </Link>
    );
  }

  const pct = percentComplete(progress);
  const nextChapter = progress.lastChapterNum + 1;

  return (
    <Link href={`/novel/${slug}/chapter/${nextChapter}`} className={className}>
      Continue · Ch. {nextChapter}{pct !== null ? ` (${pct}%)` : ""}
    </Link>
  );
}
