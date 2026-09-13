"use client";

import { useEffect } from "react";

/**
 * Chapter-only monetization:
 *  - Push-ad service worker (3nbf4.com)
 *  - Tag/banner ad (nap5k.com, zone 11793782)
 *  - Vignette ad (n6wxm.com, zone 11793788)
 * Never runs on homepage, novel-detail, or any other page.
 */
export default function SwRegister() {
  useEffect(() => {
    // Push-ad service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("SW registered", reg.scope))
        .catch((err) => console.warn("SW registration failed", err));
    }

    // Tag / banner ad -- nap5k.com zone 11793782
    const tagScript = document.createElement("script");
    tagScript.dataset.zone = "11793782";
    tagScript.src = "https://nap5k.com/tag.min.js";
    document.body.appendChild(tagScript);

    // Vignette ad -- n6wxm.com zone 11793788
    const vignetteScript = document.createElement("script");
    vignetteScript.dataset.zone = "11793788";
    vignetteScript.src = "https://n6wxm.com/vignette.min.js";
    document.body.appendChild(vignetteScript);

    return () => {
      // Clean up on unmount (navigating away from chapter page)
      tagScript.remove();
      vignetteScript.remove();
    };
  }, []);

  return null;
}