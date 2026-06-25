"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import NovelCard from "@/components/novel/NovelCard";
import { novelsApi } from "@/lib/api";
import type { Novel } from "@/types/api";
import styles from "./page.module.css";

const GENRES = [
  "Action","Adventure","Comedy","Drama","Fantasy","Harem","Historical",
  "Horror","Isekai","Josei","Martial Arts","Mecha","Mystery","Psychological",
  "Romance","School Life","Sci-Fi","Slice of Life","Sports","Supernatural",
  "System","Tragedy","Wuxia","Xianxia","Xuanhuan",
];
const STATUSES = ["ongoing", "completed"];
const SORTS = [
  { label: "Most popular",     value: "views"  },
  { label: "Highest rated",    value: "rating" },
  { label: "Newly added",      value: "added"  },
  { label: "Recently updated", value: "new"    },
];

export default function BrowseContent() {
  const searchParams = useSearchParams();

  const [novels,  setNovels]  = useState<Novel[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);

  const [sort,   setSort]   = useState(searchParams.get("sort")   || "views");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [genre,  setGenre]  = useState(searchParams.get("genre")  || "");
  const [view,   setView]   = useState<"grid" | "list">("grid");

  // Mobile filter drawer
  const [filterOpen, setFilterOpen] = useState(false);

  const limit = 24;

  const loadNovels = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        sort,
        page:  String(page),
        limit: String(limit),
      };
      if (status) params.status = status;
      if (genre)  params.genre  = genre;

      const data = await novelsApi.list(params) as any;
      setNovels(data.novels);
      setTotal(data.total);
    } catch {
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, [sort, status, genre, page]);

  useEffect(() => { loadNovels(); }, [loadNovels]);
  useEffect(() => { setPage(1); }, [sort, status, genre]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (filterOpen) document.body.style.overflow = "hidden";
    else            document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen]);

  const totalPages   = Math.ceil(total / limit);
  const toggleStatus = (s: string) => setStatus(prev => prev === s ? "" : s);
  const toggleGenre  = (g: string) => {
    setGenre(prev => prev === g ? "" : g);
    setFilterOpen(false);
  };
  const clearAll = () => { setStatus(""); setGenre(""); setSort("views"); setPage(1); };
  const hasFilters = !!status || !!genre;
  const activeCount = (status ? 1 : 0) + (genre ? 1 : 0);

  // Shared filter panel content (used in both sidebar and drawer)
  function FilterPanel() {
    return (
      <>
        {hasFilters && (
          <button className={styles.clearAll} onClick={() => { clearAll(); setFilterOpen(false); }}>
            ✕ Clear all filters
          </button>
        )}

        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Status</div>
          {STATUSES.map(s => (
            <label key={s} className={styles.filterOpt}>
              <input type="checkbox" checked={status === s} onChange={() => toggleStatus(s)} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Genre</div>
          <div className={styles.genreList}>
            {GENRES.map(g => (
              <label
                key={g}
                className={`${styles.genreOpt} ${genre === g ? styles.genreOptActive : ""}`}
              >
                <input
                  type="checkbox"
                  checked={genre === g}
                  onChange={() => toggleGenre(g)}
                  className={styles.genreCheck}
                />
                {g}
              </label>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>Browse novels</h1>

        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        {/* ── Mobile filter bar (hidden on desktop via CSS) ── */}
        <div className={styles.mobileBar}>
          <button
            className={styles.filterToggle}
            style={activeCount > 0 ? {
              borderColor: "var(--pink)",
              color: "var(--pink)",
              background: "var(--pink-light)"
            } : {}}
            onClick={() => setFilterOpen(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4"  y1="6"  x2="20" y2="6"/>
              <line x1="8"  y1="12" x2="20" y2="12"/>
              <line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Filters
            {activeCount > 0 && (
              <span className={styles.filterBadge}>{activeCount}</span>
            )}
          </button>

          <select
            className={styles.mobileSortSelect}
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className={styles.layout}>
          {/* ── Desktop sidebar ── */}
          <aside className={styles.sidebar}>
            <FilterPanel />
          </aside>

          {/* ── Results ── */}
          <div className={styles.results}>
            {hasFilters && (
              <div className={styles.chips}>
                {status && (
                  <span className={styles.chip}>
                    {status}
                    <button onClick={() => setStatus("")}>✕</button>
                  </span>
                )}
                {genre && (
                  <span className={styles.chip}>
                    {genre}
                    <button onClick={() => setGenre("")}>✕</button>
                  </span>
                )}
              </div>
            )}

            <div className={styles.resultsBar}>
              <span className={styles.count}><strong>{total}</strong> novels</span>
              <div className={styles.barRight}>
                {/* Sort select — hidden on mobile (mobile has its own above) */}
                <select
                  className={styles.desktopSortSelect}
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${view === "grid" ? styles.viewActive : ""}`}
                    onClick={() => setView("grid")}
                    title="Grid"
                  >⊞</button>
                  <button
                    className={`${styles.viewBtn} ${view === "list" ? styles.viewActive : ""}`}
                    onClick={() => setView("list")}
                    title="List"
                  >☰</button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : novels.length === 0 ? (
              <p className={styles.empty}>No novels found. Try clearing some filters.</p>
            ) : view === "grid" ? (
              <div className={styles.grid}>
                {novels.map(n => <NovelCard key={n._id} novel={n} />)}
              </div>
            ) : (
              <div className={styles.listView}>
                {novels.map(n => (
                  <a key={n._id} href={`/novel/${n.slug}`} className={styles.listItem}>
                    {/* ── Cover: use <img> not backgroundImage to avoid silent failures ── */}
                    <div className={styles.listCoverWrap}>
                      {n.cover ? (
                        <img
                          src={n.cover}
                          alt={n.title}
                          className={styles.listCoverImg}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.listCoverFallback} />
                      )}
                    </div>
                    <div className={styles.listInfo}>
                      <div className={styles.listTitle}>{n.title}</div>
                      <div className={styles.listMeta}>
                        <span className={styles.listRating}>★ {Number(n.rating).toFixed(1)}</span>
                        <span> · {n.status}</span>
                      </div>
                      {n.description && (
                        <p className={styles.listDesc}>{n.description}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  );
                })}
                {totalPages > 5 && <span className={styles.pageDots}>…</span>}
                <button
                  className={styles.pageBtn}
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >›</button>
              </div>
            )}
          </div>
        </div>

        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {filterOpen && (
        <div className={styles.overlay} onClick={() => setFilterOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Filters</span>
              <button className={styles.drawerClose} onClick={() => setFilterOpen(false)}>✕</button>
            </div>
            <div className={styles.drawerBody}>
              <FilterPanel />
            </div>
            <div className={styles.drawerFooter}>
              <button className={styles.drawerApply} onClick={() => setFilterOpen(false)}>
                Show {total} novels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
