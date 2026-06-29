import type { Metadata } from "next";
import Link from "next/link";
import styles from "../static-page.module.css";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of HanaReads.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "25 June 2026";
const CONTACT_EMAIL = "idenwebstudio@gmail.com"; // ← update to your real address

export default function TermsPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroEyebrow}>Legal</p>
          <h1 className={styles.heroTitle}>Terms of Service</h1>
          <p className={styles.heroSub}>
            By using HanaReads you agree to these terms. Please read them carefully — they are written in plain English.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Main prose */}
          <article className={styles.prose}>
            <p className={styles.updatedNote}>Last updated: {LAST_UPDATED}</p>

            <h2>1. Acceptance of terms</h2>
            <p>
              By accessing or using the HanaReads website (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use the Service.
            </p>

            <hr className={styles.divider} />

            <h2>2. Use of the Service</h2>
            <p>You may use HanaReads for personal, non-commercial reading purposes only. You agree not to:</p>
            <ul>
              <li>Copy, redistribute, or republish any content from HanaReads without written permission</li>
              <li>Scrape, crawl, or systematically download content from the site</li>
              <li>Attempt to gain unauthorised access to any part of the Service</li>
              <li>Use the Service in a way that could harm, disable, or impair it</li>
              <li>Create accounts by automated means or under false pretences</li>
            </ul>

            <hr className={styles.divider} />

            <h2>3. Accounts</h2>
            <p>
              You must provide a valid email address to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or that are found to be engaged in abusive behaviour.
            </p>

            <hr className={styles.divider} />

            <h2>4. Intellectual property</h2>
            <p>
              The novels and translated content available on HanaReads are the intellectual property of their respective authors and rights holders. HanaReads does not claim ownership over any of the literary works hosted on the platform.
            </p>
            <p>
              The HanaReads brand, logo, website design, and original platform code are owned by HanaReads and may not be reproduced without permission.
            </p>
            <p>
              If you believe content on HanaReads infringes your copyright, please <Link href="/contact" style={{ color: "var(--pink)" }}>contact us</Link> with a detailed description and we will act promptly.
            </p>

            <hr className={styles.divider} />

            <h2>5. Disclaimer of warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that any defects will be corrected. We make no warranties about the accuracy or completeness of any content on the platform.
            </p>

            <hr className={styles.divider} />

            <h2>6. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, HanaReads shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of, or inability to use, the Service.
            </p>

            <hr className={styles.divider} />

            <h2>7. Third-party links</h2>
            <p>
              The Service may contain links to third-party websites. These are provided for convenience only. HanaReads is not responsible for the content or privacy practices of those sites.
            </p>

            <hr className={styles.divider} />

            <h2>8. Changes to these Terms</h2>
            <p>
              We may update these Terms at any time. Changes take effect when posted. Continued use of the Service after an update constitutes acceptance of the revised Terms. We will update the &ldquo;Last updated&rdquo; date at the top of this page whenever changes are made.
            </p>

            <hr className={styles.divider} />

            <h2>9. Governing law</h2>
            <p>
              These Terms are governed by applicable law. Any disputes shall be resolved in the courts of the jurisdiction in which HanaReads operates.
            </p>

            <hr className={styles.divider} />

            <h2>10. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "var(--pink)" }}>{CONTACT_EMAIL}</a>{" "}
              or use our <Link href="/contact" style={{ color: "var(--pink)" }}>contact form</Link>.
            </p>
          </article>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>On this page</p>
              <Link href="#" className={styles.cardLink}>1. Acceptance</Link>
              <Link href="#" className={styles.cardLink}>2. Use of the Service</Link>
              <Link href="#" className={styles.cardLink}>3. Accounts</Link>
              <Link href="#" className={styles.cardLink}>4. Intellectual property</Link>
              <Link href="#" className={styles.cardLink}>5. Disclaimer</Link>
              <Link href="#" className={styles.cardLink}>6. Liability</Link>
              <Link href="#" className={styles.cardLink}>7. Third-party links</Link>
              <Link href="#" className={styles.cardLink}>8. Changes</Link>
              <Link href="#" className={styles.cardLink}>9. Governing law</Link>
              <Link href="#" className={styles.cardLink}>10. Contact</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Related</p>
              <Link href="/privacy" className={styles.cardLink}>→ Privacy Policy</Link>
              <Link href="/about" className={styles.cardLink}>→ About Us</Link>
              <Link href="/contact" className={styles.cardLink}>→ Contact Us</Link>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Questions?</p>
              <p className={styles.cardText}>
                If anything in these Terms is unclear, please reach out before using the Service.
              </p>
              <Link href="/contact" className={styles.cardLink}>→ Contact us</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
