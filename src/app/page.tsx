import { Metadata } from "next";
import Link from "next/link";
import NovelCard from "@/components/novel/NovelCard";
import styles from "./page.module.css";

const API  = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID  || "site1";

async function getTrending() {
  try {
    const url = `${API}/novels/trending?site=${SITE}&limit=12`;
    console.log("[getTrending] fetching:", url);
    const res = await fetch(url, { cache: "no-store" });
    console.log("[getTrending] status:", res.status);
    return res.ok ? res.json() : [];
  } catch (e) {
    console.error("[getTrending] error:", e);
    return [];
  }
}

async function getNewlyUpdated() {
  try {
    const url = `${API}/novels?site=${SITE}&sort=new&limit=6`;
    console.log("[getNewlyUpdated] fetching:", url);
    const res = await fetch(url, { cache: "no-store" });
    console.log("[getNewlyUpdated] status:", res.status);
    const data = await res.json();
    return data.novels || [];
  } catch (e) {
    console.error("[getNewlyUpdated] error:", e);
    return [];
  }
}

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [trending, newlyUpdated] = await Promise.all([getTrending(), getNewlyUpdated()]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Discover <em>Korean romance</em> novels in English
          </h1>
          <p className={styles.heroSub}>
            Fresh translations, weekly updates, and a community of readers who love the same stories you do.
          </p>
          <div className={styles.heroBtns}>
            <Link href="/browse" className={styles.btnPrimary}>Browse all novels</Link>
            <Link href="/rankings" className={styles.btnSecondary}>See rankings</Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Top ad slot */}
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Trending */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending this week</h2>
            <Link href="/browse?sort=popular" className={styles.seeAll}>See all →</Link>
          </div>
          {trending.length > 0 ? (
            <div className={styles.grid}>
              {trending.map((n: any) => <NovelCard key={n._id} novel={n} />)}
            </div>
          ) : (
            <p className={styles.empty}>No novels yet — check back soon.</p>
          )}
        </section>

        {/* Mid ad slot */}
        <div className={`ad-slot ${styles.adMid}`}>— advertisement —</div>

        {/* Recently updated */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently updated</h2>
            <Link href="/browse?sort=new" className={styles.seeAll}>See all →</Link>
          </div>
          {newlyUpdated.length > 0 ? (
            <div className={styles.grid}>
              {newlyUpdated.map((n: any) => <NovelCard key={n._id} novel={n} />)}
            </div>
          ) : (
            <p className={styles.empty}>No novels yet — check back soon.</p>
          )}
        </section>
      </div>
    </div>
  );
}
