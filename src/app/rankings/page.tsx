import { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID || "site1";

export const metadata: Metadata = { title: "Rankings" };

async function fetchRanking(sort: string, limit = 20) {
  try {
    const res = await fetch(`${API}/novels?site=${SITE}&sort=${sort}&limit=${limit}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.novels || [];
  } catch { return []; }
}

export default async function RankingsPage() {
  const [byRating, byViews, byUpdated] = await Promise.all([
    fetchRanking("rating", 10),
    fetchRanking("popular", 10),
    fetchRanking("updated", 10),
  ]);

  const RankList = ({ novels }: { novels: any[] }) => (
    <div className={styles.rankList}>
      {novels.length === 0 && <p className={styles.empty}>No data yet.</p>}
      {novels.map((n, i) => (
        <Link key={n.id} href={`/novel/${n.slug}`} className={styles.rankItem}>
          <span className={`${styles.rankNum} ${i < 3 ? styles.top3 : ""}`}>{i + 1}</span>
          <div className={styles.rankCover} />
          <div className={styles.rankInfo}>
            <div className={styles.rankTitle}>{n.title}</div>
            <div className={styles.rankMeta}>
              ★ {Number(n.avg_rating).toFixed(1)} · {n.status}
            </div>
          </div>
          <span className={styles.rankViews}>{(n.view_count / 1000).toFixed(0)}k</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>Rankings</h1>

        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        <div className={styles.cols}>
          <section>
            <h2 className={styles.sectionTitle}>Top rated</h2>
            <RankList novels={byRating} />
          </section>
          <section>
            <h2 className={styles.sectionTitle}>Most read</h2>
            <RankList novels={byViews} />
          </section>
          <section>
            <h2 className={styles.sectionTitle}>Recently updated</h2>
            <RankList novels={byUpdated} />
          </section>
        </div>

        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
