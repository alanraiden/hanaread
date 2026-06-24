"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Novel } from "@/types/api";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID  || "site1";

const TABS = [
  { label: "Top rated",        sort: "rating" },
  { label: "Most read",        sort: "views"  },
  { label: "Recently updated", sort: "new"    },
];

async function fetchRanking(sort: string, limit = 20): Promise<Novel[]> {
  try {
    const res = await fetch(`${API}/novels?site=${SITE}&sort=${sort}&limit=${limit}`, {
      cache: "no-store",
    });
    const data = await res.json() as { novels?: Novel[] };
    return data.novels ?? [];
  } catch { return []; }
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [novels,    setNovels]    = useState<Novel[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchRanking(TABS[activeTab].sort, 20)
      .then(setNovels)
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>Rankings</h1>

        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Tab bar */}
        <div className={styles.tabs}>
          {TABS.map((tab, i) => (
            <button
              key={tab.sort}
              className={`${styles.tab} ${i === activeTab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rank list */}
        {loading ? (
          <div className={styles.rankList}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : novels.length === 0 ? (
          <p className={styles.empty}>No data yet.</p>
        ) : (
          <div className={styles.rankList}>
            {novels.map((n, i) => (
              <Link key={n._id} href={`/novel/${n.slug}`} className={styles.rankItem}>
                <span className={`${styles.rankNum} ${i < 3 ? styles.top3 : ""}`}>
                  {i + 1}
                </span>
                <div
                  className={styles.rankCover}
                  style={n.cover ? {
                    backgroundImage: `url(${n.cover})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  } : {}}
                />
                <div className={styles.rankInfo}>
                  <div className={styles.rankTitle}>{n.title}</div>
                  <div className={styles.rankMeta}>
                    ★ {Number(n.rating).toFixed(1)} · {n.status}
                  </div>
                </div>
                <span className={styles.rankViews}>
                  {n.views >= 1000
                    ? `${(n.views / 1000).toFixed(1)}k`
                    : n.views}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
