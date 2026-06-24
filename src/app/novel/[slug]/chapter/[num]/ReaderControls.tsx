"use client";

import { useState, useEffect } from "react";
import styles from "./ReaderControls.module.css";

export default function ReaderControls() {
  const [fontSize, setFontSize] = useState(17);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("sans");

  useEffect(() => {
    const saved = localStorage.getItem("hr_reader_prefs");
    if (saved) {
      const { fontSize: fs, fontFamily: ff } = JSON.parse(saved);
      if (fs) setFontSize(fs);
      if (ff) setFontFamily(ff);
    }
  }, []);

  const update = (fs: number, ff: "sans" | "serif") => {
    setFontSize(fs);
    setFontFamily(ff);
    localStorage.setItem("hr_reader_prefs", JSON.stringify({ fontSize: fs, fontFamily: ff }));
    const body = document.getElementById("chapter-body");
    if (body) {
      body.style.fontSize = fs + "px";
      body.style.fontFamily = ff === "serif" ? "Georgia, 'Times New Roman', serif" : "inherit";
    }
  };

  return (
    <div className={styles.controls}>
      <span className={styles.label}>Font</span>
      <button className={`${styles.pill} ${fontFamily === "sans" ? styles.active : ""}`} onClick={() => update(fontSize, "sans")}>Sans</button>
      <button className={`${styles.pill} ${fontFamily === "serif" ? styles.active : ""}`} onClick={() => update(fontSize, "serif")}>Serif</button>
      <div className={styles.divider} />
      <span className={styles.label}>Size</span>
      <button className={styles.sizeBtn} onClick={() => update(Math.max(14, fontSize - 1), fontFamily)}>−</button>
      <span className={styles.sizeVal}>{fontSize}px</span>
      <button className={styles.sizeBtn} onClick={() => update(Math.min(24, fontSize + 1), fontFamily)}>+</button>
    </div>
  );
}
