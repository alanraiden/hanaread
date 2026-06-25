// ─── SEO FIX: browse/layout.tsx ──────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// browse/page.tsx uses "use client" which means Next.js cannot export `metadata`
// from it. The fix is to add a layout.tsx for this route segment — Next.js WILL
// pick up the metadata from a layout file and apply it to the page.
//
// This gives the browse page its own title, description, and canonical URL.
//
import { Metadata } from "next";

export const metadata: Metadata = {
  // SEO FIX: Unique title for browse page (was using the site default)
  title: "Browse Novels",

  // SEO FIX: Unique description for browse page
  description:
    "Browse hundreds of Korean romance novels in English. Filter by genre, sort by rating or views, and find your next favourite read.",

  // SEO FIX: Canonical URL for the browse page
  alternates: {
    canonical: "/browse",
  },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
