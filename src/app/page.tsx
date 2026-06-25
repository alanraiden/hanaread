import { Metadata } from "next";
import Link from "next/link";
import NovelCard from "@/components/novel/NovelCard";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const API  = process.env.NEXT_PUBLIC_API_URL  || "http://localhost:4000/api";
const SITE = process.env.NEXT_PUBLIC_SITE_ID  || "site1";

async function getTrending() {
  try {
    const res = await fetch(`${API}/novels/trending?site=${SITE}&limit=12`, {
      next: { revalidate: 300 },
    });
    return res.ok ? res.json() : [];
  } catch { return []; }
}

async function getNewlyUpdated() {
  try {
    const res = await fetch(`${API}/novels?site=${SITE}&sort=new&limit=6`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.novels || [];
  } catch { return []; }
}

// ─── SEO FIX: Unique title + description + canonical for the home page ────────
export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover the best Korean romance novels in English. Read trending titles, explore new translations, and follow your favorite stories — updated weekly.",
  alternates: {
    canonical: "/",
  },
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
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* Trending */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            {/* SEO FIX: h2 was already here — good! */}
            <h2 className={styles.sectionTitle}>Trending this week</h2>
            <Link href="/browse?sort=views" className={styles.seeAll}>See all →</Link>
          </div>
          {trending.length > 0 ? (
            <div className={styles.grid}>
              {trending.map((n: any) => <NovelCard key={n._id} novel={n} />)}
            </div>
          ) : (
            <p className={styles.empty}>No novels yet — check back soon.</p>
          )}
        </section>

        <div className={`ad-slot ${styles.adMid}`}>— advertisement —</div>

        {/* Recently updated */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            {/* SEO FIX: h2 was already here — good! */}
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
