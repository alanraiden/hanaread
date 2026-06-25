import type { Metadata } from "next";
import Link from "next/link";
import styles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about HanaReads — a fan-driven library dedicated to bringing Korean romance novels to English-speaking readers worldwide.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroEyebrow}>Our story</p>
          <h1 className={styles.heroTitle}>About HanaReads</h1>
          <p className={styles.heroSub}>
            A fan-driven library bringing the best Korean romance novels to English readers — one chapter at a time.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Main prose */}
          <article className={styles.prose}>
            <h2>Why HanaReads exists</h2>
            <p>
              Korean romance novels have taken the world by storm — rich storytelling, unforgettable chemistry, and
              emotional depth that keeps readers up past midnight. Yet for a long time, most of these stories were
              locked behind a language barrier. HanaReads was built to change that.
            </p>
            <p>
              We started as a small reading community that shared translated chapters in group chats. Over time, the
              demand grew and so did we. Today HanaReads is a curated library where readers can discover, read, and
              follow their favourite Korean romance titles without ever leaving one place.
            </p>

            <hr className={styles.divider} />

            <h2>What we offer</h2>
            <div className={styles.values}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>📚</div>
                <div className={styles.valueTitle}>Curated library</div>
                <div className={styles.valueDesc}>Hand-picked titles across every romance subgenre — from CEO romances to fantasy reincarnations.</div>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🔄</div>
                <div className={styles.valueTitle}>Weekly updates</div>
                <div className={styles.valueDesc}>New chapters drop regularly so you never have to wait long to find out what happens next.</div>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🌸</div>
                <div className={styles.valueTitle}>Clean reading</div>
                <div className={styles.valueDesc}>A distraction-free reader optimised for mobile, so you can read anywhere, anytime.</div>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🔖</div>
                <div className={styles.valueTitle}>Bookmarks</div>
                <div className={styles.valueDesc}>Save your place across multiple novels and pick up exactly where you left off.</div>
              </div>
            </div>

            <hr className={styles.divider} />

            <h2>Our commitment to readers</h2>
            <p>
              We take quality seriously. Every novel goes through an editorial review before it&rsquo;s listed on the
              platform. We prioritise readability — clear English, consistent terminology, and faithful translations
              that honour the author&rsquo;s original voice.
            </p>
            <p>
              HanaReads is and always will be free to read. We believe great stories should be accessible to everyone.
            </p>

            <hr className={styles.divider} />

            <h2>Respect for creators</h2>
            <p>
              We deeply respect the authors whose work appears on HanaReads. If you are a rights holder and have
              concerns about content on the platform, please{" "}
              <Link href="/contact" style={{ color: "var(--pink)" }}>contact us</Link>{" "}
              and we will respond promptly.
            </p>
          </article>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Quick links</p>
              <Link href="/browse" className={styles.cardLink}>→ Browse novels</Link>
              <Link href="/rankings" className={styles.cardLink}>→ Rankings</Link>
              <Link href="/auth/signup" className={styles.cardLink}>→ Create an account</Link>
              <Link href="/contact" className={styles.cardLink}>→ Contact us</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Legal</p>
              <Link href="/privacy" className={styles.cardLink}>→ Privacy Policy</Link>
              <Link href="/terms" className={styles.cardLink}>→ Terms of Service</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Have a question?</p>
              <p className={styles.cardText}>
                We&rsquo;d love to hear from you. Reach out with feedback, novel suggestions, or anything else on your mind.
              </p>
              <Link href="/contact" className={styles.cardLink}>→ Send us a message</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
