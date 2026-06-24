"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NovelCard from "@/components/novel/NovelCard";
import { novelsApi } from "@/lib/api";
import styles from "./page.module.css";

const GENRES = ["CEO Romance", "Historical", "Isekai", "Revenge", "Second Chance", "Slow Burn", "Amnesia", "Modern", "Fantasy"];
const STATUSES = ["ongoing", "completed", "hiatus"];
const LENGTHS = [
  { label: "Short (<100 ch)", value: "short" },
  { label: "Medium (100–300)", value: "medium" },
  { label: "Long (300+)", value: "long" },
];
const SORTS = [
  { label: "Most popular", value: "popular" },
  { label: "Highest rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Recently updated", value: "updated" },
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [novels, setNovels] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState(searchParams.get("sort") || "popular");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [view, setView] = useState<"grid" | "list">("grid");

  const limit = 24;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { sort, page, limit };
      if (status) params.status = status;
      if (genre)  params.genre  = genre;
      const data = await novelsApi.list(params);
      setNovels(data.novels || []);
      setTotal(data.total || 0);
    } catch {
      setNovels([]);
    } finally {
      setLoading(false);
    }
  }, [sort, status, genre, page]);

  useEffect(() => { fetch(); }, [fetch]);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [sort, status, genre]);

  const totalPages = Math.ceil(total / limit);

  const toggleStatus = (s: string) => setStatus(prev => prev === s ? "" : s);
  const toggleGenre  = (g: string) => setGenre(prev => prev === g ? "" : g);

  const clearAll = () => { setStatus(""); setGenre(""); setSort("popular"); setPage(1); };
  const hasFilters = !!status || !!genre;

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.heading}>Browse novels</h1>

        {/* Top ad */}
        <div className={`ad-slot ${styles.adTop}`}>— advertisement —</div>

        <div className={styles.layout}>
          {/* ── Sidebar filters ── */}
          <aside className={styles.sidebar}>
            {hasFilters && (
              <button className={styles.clearAll} onClick={clearAll}>✕ Clear all filters</button>
            )}

            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>Status</div>
              {STATUSES.map(s => (
                <label key={s} className={styles.filterOpt}>
                  <input
                    type="checkbox"
                    checked={status === s}
                    onChange={() => toggleStatus(s)}
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>

            <div className={styles.filterDivider} />

            <div className={styles.filterGroup}>
              <div className={styles.filterLabel}>Genre</div>
              {GENRES.map(g => (
                <label key={g} className={styles.filterOpt}>
                  <input
                    type="checkbox"
                    checked={genre === g}
                    onChange={() => toggleGenre(g)}
                  />
                  {g}
                </label>
              ))}
            </div>
          </aside>

          {/* ── Results ── */}
          <div className={styles.results}>
            {/* Active filter chips */}
            {hasFilters && (
              <div className={styles.chips}>
                {status && (
                  <span className={styles.chip}>
                    {status} <button onClick={() => setStatus("")}>✕</button>
                  </span>
                )}
                {genre && (
                  <span className={styles.chip}>
                    {genre} <button onClick={() => setGenre("")}>✕</button>
                  </span>
                )}
              </div>
            )}

            {/* Results topbar */}
            <div className={styles.resultsBar}>
              <span className={styles.count}>
                <strong>{total}</strong> novels
              </span>
              <div className={styles.barRight}>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                >
                  {SORTS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${view === "grid" ? styles.viewActive : ""}`}
                    onClick={() => setView("grid")}
                    title="Grid"
                  >
                    ⊞
                  </button>
                  <button
                    className={`${styles.viewBtn} ${view === "list" ? styles.viewActive : ""}`}
                    onClick={() => setView("list")}
                    title="List"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>

            {/* Novel grid / list */}
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
                {novels.map(n => <NovelCard key={n.id} novel={n} />)}
              </div>
            ) : (
              <div className={styles.listView}>
                {novels.map(n => (
                  <a key={n.id} href={`/novel/${n.slug}`} className={styles.listItem}>
                    <div className={styles.listCover} style={{
                      background: "linear-gradient(160deg, #F4C0D1, #993556)"
                    }} />
                    <div className={styles.listInfo}>
                      <div className={styles.listTitle}>{n.title}</div>
                      <div className={styles.listMeta}>
                        <span className={styles.listRating}>★ {Number(n.avg_rating).toFixed(1)}</span>
                        <span> · {n.status}</span>
                      </div>
                      {n.synopsis && (
                        <p className={styles.listDesc}>{n.synopsis}</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Pagination */}
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

        {/* Bottom ad */}
        <div className={`ad-slot ${styles.adBottom}`}>— advertisement —</div>
      </div>
    </div>
  );
}
