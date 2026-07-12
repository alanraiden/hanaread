// ─────────────────────────────────────────────────────────────────────────────
// Reading progress tracker (client-side, localStorage-backed)
//
// Stores, per novel, the last chapter the reader opened so we can render a
// "Continue Reading" shelf and per-novel progress bars. No backend/API calls
// — everything lives in the browser under a single localStorage key.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "hr_reading_progress";

export interface ReadingProgress {
  novelId: string;
  slug: string;
  title: string;
  cover?: string;
  status?: string;
  /** Highest chapter number the reader has opened */
  lastChapterNum: number;
  lastChapterTitle?: string;
  /** Total chapters available for the novel, when known — used for % complete */
  totalChapters?: number;
  /** ISO timestamp of the last time progress was recorded */
  updatedAt: string;
}

type ProgressMap = Record<string, ReadingProgress>; // keyed by slug

function isBrowser() {
  return typeof window !== "undefined";
}

function readAll(): ProgressMap {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: ProgressMap) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}

/**
 * Record that the reader has opened a chapter. Only advances progress
 * forward — re-opening an earlier chapter (e.g. to re-read) won't roll
 * "last read" backwards, but does refresh updatedAt so it still surfaces
 * near the top of "Continue Reading".
 */
export function recordProgress(entry: {
  novelId: string;
  slug: string;
  title: string;
  cover?: string;
  status?: string;
  chapterNum: number;
  chapterTitle?: string;
  totalChapters?: number;
}): void {
  if (!isBrowser()) return;
  const all = readAll();
  const existing = all[entry.slug];

  all[entry.slug] = {
    novelId: entry.novelId,
    slug: entry.slug,
    title: entry.title,
    cover: entry.cover,
    status: entry.status,
    lastChapterNum: Math.max(entry.chapterNum, existing?.lastChapterNum ?? 0),
    lastChapterTitle:
      entry.chapterNum >= (existing?.lastChapterNum ?? 0)
        ? entry.chapterTitle
        : existing?.lastChapterTitle,
    totalChapters: entry.totalChapters ?? existing?.totalChapters,
    updatedAt: new Date().toISOString(),
  };

  writeAll(all);
}

export function getProgress(slug: string): ReadingProgress | null {
  return readAll()[slug] ?? null;
}

/** All tracked novels, most recently read first. */
export function getAllProgress(): ReadingProgress[] {
  return Object.values(readAll()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function removeProgress(slug: string): void {
  const all = readAll();
  delete all[slug];
  writeAll(all);
}

/** Percent through the novel (0-100), or null if total chapter count is unknown. */
export function percentComplete(entry: ReadingProgress): number | null {
  if (!entry.totalChapters || entry.totalChapters <= 0) return null;
  const pct = (entry.lastChapterNum / entry.totalChapters) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}
