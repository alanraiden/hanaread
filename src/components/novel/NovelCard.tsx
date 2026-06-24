import Link from "next/link";
import Image from "next/image";
import styles from "./NovelCard.module.css";

interface Props {
  novel: {
    _id: string;
    slug: string;
    title: string;
    cover?: string;
    status: string;
    rating: number;
    chapterCount?: number;
  };
}

export default function NovelCard({ novel }: Props) {
  return (
    <Link href={`/novel/${novel.slug}`} className={styles.card}>
      <div className={styles.thumb}>
        {novel.cover ? (
          <Image src={novel.cover} alt={novel.title} fill sizes="140px" style={{ objectFit: "cover" }} />
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
        <span className={styles.rating}>★ {Number(novel.rating).toFixed(1)}</span>
        {novel.chapterCount ? <span> · {novel.chapterCount} ch</span> : null}
      </div>
    </Link>
  );
}
