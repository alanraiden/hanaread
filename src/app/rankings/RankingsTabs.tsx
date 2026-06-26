"use client";

import { useState } from "react";
import Link from "next/link";
import type { Novel } from "@/types/api";
import styles from "./page.module.css";

const TABS = [
  { label: "Top rated",        sort: "rating" },
  { label: "Most read",        sort: "views"  },
  { label: "Recently updated", sort: "new"    },
] as const;

interface Props {
  // SEO: all three tabs' data is fetched server-side in page.tsx and passed
  // down here already populated, so the *visible* tab on first load is real
  // server-rendered HTML for Googlebot, and switching tabs after that is
  // instant (no client fetch / no loading flash) since we already have all
  // three lists in memory.
  initialData: Record<string, Novel[]>;
}

export default function RankingsTabs({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const novels = initialData[TABS[activeTab].sort] ?? [];

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
        {novels.length === 0 ? (
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
