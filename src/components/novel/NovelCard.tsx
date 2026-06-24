import Link from "next/link";
import Image from "next/image";
import styles from "./NovelCard.module.css";

interface Props {
  novel: {
    slug: string;
    title: string;
    cover_url?: string;
    status: string;
    avg_rating: number;
    chapter_count?: number;
  };
}

export default function NovelCard({ novel }: Props) {
  return (
    <Link href={`/novel/${novel.slug}`} className={styles.card}>
      <div className={styles.thumb}>
        {novel.cover_url ? (
          <Image src={novel.cover_url} alt={novel.title} fill sizes="140px" style={{ objectFit: "cover" }} />
        ) : (
          <div className={styles.placeholder}>
            <span>{novel.title.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className={`${styles.badge} ${styles[novel.status]}`}>
          {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
        </span>
      </div>
      <div className={styles.title}>{novel.title}</div>
      <div className={styles.meta}>
        <span className={styles.rating}>★ {Number(novel.avg_rating).toFixed(1)}</span>
        {novel.chapter_count ? <span> · {novel.chapter_count} ch</span> : null}
      </div>
    </Link>
  );
}
