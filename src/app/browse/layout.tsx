// ─── SEO FIX: browse/layout.tsx ──────────────────────────────────────────────
//
// page.tsx is now a server component (see SSR fix there), but metadata is
// kept in this segment layout for a clean separation between data-fetching
// and SEO tags. Gives the browse page its own title, description, canonical
// URL, and (newly added) page-specific OpenGraph tags.
//
import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hanareads.fun";

export const metadata: Metadata = {
  // SEO FIX: Unique title for browse page (was using the site default)
  title: "Browse Novels",

  // SEO FIX: accurate description — previously claimed "hundreds of novels"
  // when the catalog has 17. Misleading meta text erodes trust once a user
  // (or Google, comparing claim vs. actual indexed page count) notices the gap.
  // Update this copy again as the catalog grows past round numbers.
  description:
    "Browse Korean web novels in English — action, fantasy, isekai, romance and more. Filter by genre, sort by rating or views, and find your next read.",

  // SEO FIX: Canonical URL for the browse page
  alternates: {
    canonical: "/browse",
  },

  // SEO FIX: previously missing — this page inherited the homepage's
  // og:url/og:title/og:description from the root layout, so social shares
  // of /browse displayed as if they were the homepage.
  openGraph: {
    title: "Browse Novels | HanaReads",
    description:
      "Browse Korean web novels in English — action, fantasy, isekai, romance and more. Filter by genre, sort by rating or views.",
    url: `${SITE_URL}/browse`,
    type: "website",
  },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
