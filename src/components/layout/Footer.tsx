import Link from "next/link";
import styles from "./Footer.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HanaReads";
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              {SITE_NAME.toLowerCase().replace(/\s/g, "")}
            </Link>
            <p className={styles.tagline}>
              Korean romance novels in English — fresh translations, weekly updates.
            </p>
          </div>

          {/* Browse */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Browse</p>
            <ul className={styles.colLinks}>
              <li><Link href="/browse">All Novels</Link></li>
              <li><Link href="/rankings">Rankings</Link></li>
              <li><Link href="/browse?status=completed">Completed</Link></li>
              <li><Link href="/browse?status=ongoing">New Chapters</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Account</p>
            <ul className={styles.colLinks}>
              <li><Link href="/auth/login">Log In</Link></li>
              <li><Link href="/auth/signup">Sign Up</Link></li>
              <li><Link href="/bookmarks">Bookmarks</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Company</p>
            <ul className={styles.colLinks}>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <span className={styles.copy}>
            © {CURRENT_YEAR} {SITE_NAME}. All rights reserved.
          </span>
          <nav className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
