"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { bookmarksApi } from "@/lib/api";
import type { Novel } from "@/types/api";
import NovelCard from "@/components/novel/NovelCard";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (user) {
      bookmarksApi.list()
        .then(setBookmarks)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>My bookmarks</h1>
        <p className={styles.sub}>{bookmarks.length} novels saved</p>

        {bookmarks.length === 0 ? (
          <div className={styles.empty}>
            <p>You haven't bookmarked any novels yet.</p>
            <a href="/browse" className={styles.browseLink}>Browse novels →</a>
          </div>
        ) : (
          <div className={styles.grid}>
            {bookmarks.map(b => (
              <div key={b._id} className={styles.bookmarkCard}>
                <NovelCard novel={b} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
