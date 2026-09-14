import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "HanaReads";
const SITE_DESC = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Read Korean romance novels in English — fresh translations, weekly updates.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hanareads.fun";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
  },
  other: {
    "google-adsense-account": "ca-pub-9481193991721439",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9481193991721439"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Monetag — vignette ad (zone 11793788) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11793788',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
        {/* Monetag — tag/push (zone 11793782) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='11793782',s.src='https://nap5k.com/tag.min.js'})([document.documentElement,document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
