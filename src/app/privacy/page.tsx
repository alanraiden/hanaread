import type { Metadata } from "next";
import Link from "next/link";
import styles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HanaReads collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "25 June 2026";
const CONTACT_EMAIL = "privacy@hanareads.fun"; // ← update to your real address

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroEyebrow}>Legal</p>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroSub}>
            We believe in transparency. Here&rsquo;s exactly what data we collect, why we collect it, and how you can control it.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Main prose */}
          <article className={styles.prose}>
            <p className={styles.updatedNote}>Last updated: {LAST_UPDATED}</p>

            <h2>1. Who we are</h2>
            <p>
              HanaReads (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website located at{" "}
              <strong>hanareads.fun</strong>. This Privacy Policy explains how we handle information collected when you visit or use our service.
            </p>

            <hr className={styles.divider} />

            <h2>2. Information we collect</h2>
            <p><strong>Account information.</strong> When you create an account we collect your email address and the username you choose. We do not collect your real name unless you provide it voluntarily.</p>
            <p><strong>Reading activity.</strong> We store bookmarks and reading progress so you can pick up where you left off across devices. This data is tied to your account.</p>
            <p><strong>Usage data.</strong> We collect standard server logs including IP address, browser type, pages visited, and timestamps. This data is used in aggregate to improve the site and is not linked to individual identities.</p>
            <p><strong>Cookies.</strong> We use a session cookie to keep you logged in and a preferences cookie to remember display settings. We do not use third-party advertising cookies.</p>

            <hr className={styles.divider} />

            <h2>3. How we use your information</h2>
            <ul>
              <li>To provide and maintain the HanaReads service</li>
              <li>To save your bookmarks and reading progress</li>
              <li>To send transactional emails (e.g. password reset) — we do not send marketing emails unless you opt in</li>
              <li>To analyse anonymous usage patterns and improve the site</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
            <p>We do not sell, rent, or share your personal information with third parties for their own marketing purposes.</p>

            <hr className={styles.divider} />

            <h2>4. Data retention</h2>
            <p>
              We retain account data for as long as your account is active. If you delete your account, we remove your personal information within 30 days, except where retention is required by law.
            </p>

            <hr className={styles.divider} />

            <h2>5. Third-party services</h2>
            <p>HanaReads may use the following third-party services, each subject to their own privacy policies:</p>
            <ul>
              <li><strong>Hosting provider</strong> — for infrastructure and server logs</li>
              <li><strong>Email service</strong> — for transactional email delivery</li>
            </ul>
            <p>We do not embed social media trackers or third-party advertising networks.</p>

            <hr className={styles.divider} />

            <h2>6. Your rights</h2>
            <p>Depending on where you live you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal data</li>
              <li>Object to certain processing of your data</li>
            </ul>
            <p>
              To exercise any of these rights, please <Link href="/contact" style={{ color: "var(--pink)" }}>contact us</Link>.
            </p>

            <hr className={styles.divider} />

            <h2>7. Children&rsquo;s privacy</h2>
            <p>
              HanaReads is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>

            <hr className={styles.divider} />

            <h2>8. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of HanaReads after changes constitutes your acceptance of the revised policy.
            </p>

            <hr className={styles.divider} />

            <h2>9. Contact</h2>
            <p>
              Questions about this Privacy Policy? Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--pink)" }}>{CONTACT_EMAIL}</a>{" "}
              or use our <Link href="/contact" style={{ color: "var(--pink)" }}>contact form</Link>.
            </p>
          </article>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>On this page</p>
              <Link href="#" className={styles.cardLink}>1. Who we are</Link>
              <Link href="#" className={styles.cardLink}>2. Information we collect</Link>
              <Link href="#" className={styles.cardLink}>3. How we use it</Link>
              <Link href="#" className={styles.cardLink}>4. Data retention</Link>
              <Link href="#" className={styles.cardLink}>5. Third parties</Link>
              <Link href="#" className={styles.cardLink}>6. Your rights</Link>
              <Link href="#" className={styles.cardLink}>7. Children</Link>
              <Link href="#" className={styles.cardLink}>8. Changes</Link>
              <Link href="#" className={styles.cardLink}>9. Contact</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Related</p>
              <Link href="/terms" className={styles.cardLink}>→ Terms of Service</Link>
              <Link href="/about" className={styles.cardLink}>→ About Us</Link>
              <Link href="/contact" className={styles.cardLink}>→ Contact Us</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Questions?</p>
              <p className={styles.cardText}>
                If anything in this policy is unclear, please don&rsquo;t hesitate to reach out.
              </p>
              <Link href="/contact" className={styles.cardLink}>→ Contact us</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
