"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { bookmarksApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import styles from "./BookmarkBtn.module.css";

interface Props { novelId: string; initialBookmarked?: boolean; }

export default function BookmarkBtn({ novelId, initialBookmarked = false }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) { router.push("/auth/login"); return; }
    setLoading(true);
    try {
      if (bookmarked) {
        await bookmarksApi.remove(novelId);
        setBookmarked(false);
      } else {
        await bookmarksApi.add(novelId);
        setBookmarked(true);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${styles.btn} ${bookmarked ? styles.active : ""}`}
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2h10v13l-5-3-5 3V2z" />
      </svg>
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
