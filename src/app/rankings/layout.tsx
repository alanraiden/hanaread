// ─── SEO FIX: rankings/layout.tsx ────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// rankings/page.tsx uses "use client" which prevents metadata exports.
// This layout gives the rankings page its own SEO tags.
//
import { Metadata } from "next";

export const metadata: Metadata = {
  // SEO FIX: Unique title for rankings page
  title: "Novel Rankings",

  // SEO FIX: Unique description for rankings page
  description:
    "See the top-ranked Korean romance novels on HanaReads. Browse by highest rating, most-read, or recently updated — discover what readers love most.",

  // SEO FIX: Canonical URL for the rankings page
  alternates: {
    canonical: "/rankings",
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
