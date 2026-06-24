"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HanaReads";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim().length < 2) return;
    router.push(`/browse?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {SITE_NAME.toLowerCase().replace(/\s/g, "")}
        </Link>

        <div className={styles.links}>
          <Link href="/browse">Browse</Link>
          <Link href="/rankings">Rankings</Link>
          <Link href="/browse?status=completed">Completed</Link>
          <Link href="/browse?status=ongoing">New chapters</Link>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search novels..."
            className={styles.searchInput}
          />
        </form>

        <div className={styles.authArea}>
          {user ? (
            <>
              <Link href="/bookmarks" className={styles.navBtn}>Bookmarks</Link>
              <button onClick={logout} className={styles.navBtn}>Log out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login"  className={styles.navBtn}>Log in</Link>
              <Link href="/auth/signup" className={styles.signupBtn}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
