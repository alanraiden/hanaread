// ─── SEO FIX: rankings/layout.tsx ────────────────────────────────────────────
//
// page.tsx is now a server component (see SSR fix there); metadata stays
// here in the segment layout so SEO tags are cleanly separated from
// data-fetching. Gives the rankings page its own title, description,
// canonical URL, and (newly added) page-specific OpenGraph tags.
//
import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hanareads.fun";

export const metadata: Metadata = {
  // SEO FIX: Unique title for rankings page
  title: "Novel Rankings",

  // SEO FIX: Unique description for rankings page
  description:
    "See the top-ranked Korean web novels on HanaReads. Browse by highest rating, most-read, or recently updated — discover what readers love most.",

  // SEO FIX: Canonical URL for the rankings page
  alternates: {
    canonical: "/rankings",
  },

  // SEO FIX: previously missing — this page inherited the homepage's
  // og:url/og:title/og:description from the root layout, so social shares
  // of /rankings displayed as if they were the homepage.
  openGraph: {
    title: "Novel Rankings | HanaReads",
    description:
      "See the top-ranked Korean web novels on HanaReads — highest rated, most-read, and recently updated.",
    url: `${SITE_URL}/rankings`,
    type: "website",
  },
};

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
