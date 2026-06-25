import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HanaReads";
const SITE_DESC = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Read Korean romance novels in English — fresh translations, weekly updates.";

// ─── SEO FIX: Add NEXT_PUBLIC_SITE_URL to your .env file ─────────────────────
// Example: NEXT_PUBLIC_SITE_URL=https://www.hanaread.com
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hanaread.com";

export const metadata: Metadata = {
  // SEO FIX: metadataBase makes all relative canonical/og URLs absolute.
  // This is required for canonical tags to work correctly in Next.js.
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    // Every page should set its own `title` — this template appends "| HanaReads"
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,

  // SEO FIX: Default canonical for the root — individual pages override this
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
