import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookmarked Novels",
  description: "Your saved novels on HanaReads.",
  alternates: { canonical: "/bookmarks" },
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
