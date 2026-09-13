/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      // ─── Sitemap: clean XML headers, no RSC Vary ──────────────────────────
     
      // ─── robots.txt: no caching issues ───────────────────────────────────
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      // ─── Security headers for all other pages ────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          {
            key:   "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src * data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://3nbf4.com https://nap5k.com https://n6wxm.com https://pagead2.googlesyndication.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' https://3nbf4.com https://nap5k.com https://n6wxm.com *",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
