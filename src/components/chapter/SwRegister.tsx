"use client";

import { useEffect } from "react";

/**
 * Registers the push-ad service worker (sw.js) for monetization.
 * Only mounted on chapter pages -- never on the homepage or novel-detail pages.
 */
export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("SW registered", reg.scope))
        .catch((err) => console.warn("SW registration failed", err));
    }
  }, []);

  return null;
}