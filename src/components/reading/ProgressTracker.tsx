"use client";

import { useEffect } from "react";
import { recordProgress } from "@/lib/reading-progress";

interface Props {
  novelId: string;
  slug: string;
  title: string;
  cover?: string;
  status?: string;
  chapterNum: number;
  chapterTitle?: string;
  totalChapters?: number;
}

/**
 * Renders nothing — just records that the current chapter was opened so it
 * shows up in "Continue Reading" and per-novel progress bars. Lives inside
 * the (server-rendered) chapter page as a client island.
 */
export default function ProgressTracker({
  novelId,
  slug,
  title,
  cover,
  status,
  chapterNum,
  chapterTitle,
  totalChapters,
}: Props) {
  useEffect(() => {
    if (!novelId || !slug || !chapterNum) return;
    recordProgress({
      novelId,
      slug,
      title,
      cover,
      status,
      chapterNum,
      chapterTitle,
      totalChapters,
    });
    // Re-run if the reader navigates between chapters without a full reload.
  }, [novelId, slug, title, cover, status, chapterNum, chapterTitle, totalChapters]);

  return null;
}
