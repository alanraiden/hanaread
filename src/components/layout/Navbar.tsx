"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { searchApi } from "@/lib/api";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HanaReads";

type SuggestionNovel = {
  _id: string;
  title: string;
  slug: string;
  cover?: string;
  rating?: number;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch]           = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionNovel[]>([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [activeIdx, setActiveIdx]     = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDrop(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchApi.query(q.trim(), 1) as any;
        const novels: SuggestionNovel[] = (data.novels ?? data.results ?? []).slice(0, 6);
        setSuggestions(novels);
        setShowDrop(novels.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
        setShowDrop(false);
      }
    }, 280);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearch(v);
    fetchSuggestions(v);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = activeIdx >= 0 ? suggestions[activeIdx]?.title : search;
    if (!q || q.trim().length < 2) return;
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      router.push(`/novel/${suggestions[activeIdx].slug}`);
    } else {
      router.push(`/browse?q=${encodeURIComponent(q.trim())}`);
    }
    setSearch("");
    setSuggestions([]);
    setShowDrop(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDrop) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setShowDrop(false);
      setActiveIdx(-1);
    }
  };

  const pickSuggestion = (novel: SuggestionNovel) => {
    router.push(`/novel/${novel.slug}`);
    setSearch("");
    setSuggestions([]);
    setShowDrop(false);
    setActiveIdx(-1);
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

        {/* Search with autocomplete */}
        <div className={styles.searchWrapper} ref={wrapperRef}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              value={search}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              placeholder="Search novels..."
              className={styles.searchInput}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showDrop}
            />
            {search && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { setSearch(""); setSuggestions([]); setShowDrop(false); }}
                aria-label="Clear search"
              >✕</button>
            )}
          </form>

          {showDrop && suggestions.length > 0 && (
            <div className={styles.dropdown} role="listbox">
              {suggestions.map((novel, i) => (
                <button
                  key={novel._id}
                  role="option"
                  aria-selected={i === activeIdx}
                  className={`${styles.dropItem} ${i === activeIdx ? styles.dropItemActive : ""}`}
                  onMouseDown={() => pickSuggestion(novel)}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <div
                    className={styles.dropCover}
                    style={novel.cover
                      ? { backgroundImage: `url(${novel.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: "linear-gradient(160deg,#F4C0D1,#993556)" }
                    }
                  />
                  <span className={styles.dropTitle}>{novel.title}</span>
                  {novel.rating != null && (
                    <span className={styles.dropRating}>★ {Number(novel.rating).toFixed(1)}</span>
                  )}
                </button>
              ))}
              <button
                className={styles.dropSeeAll}
                onMouseDown={() => {
                  router.push(`/browse?q=${encodeURIComponent(search.trim())}`);
                  setSearch(""); setSuggestions([]); setShowDrop(false);
                }}
              >
                See all results for &ldquo;{search}&rdquo; →
              </button>
            </div>
          )}
        </div>

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
