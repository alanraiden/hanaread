import { Suspense } from "react";
import type { Metadata } from "next";
import BrowseContent from "./BrowseContent";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Browse" };

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className={styles.suspenseFallback}>Loading…</div>}>
      <BrowseContent />
    </Suspense>
  );
}
