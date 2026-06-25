/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // ─── SEO FIX: Security Headers ───────────────────────────────────────────
  // Fixes: "Missing Secure Referrer-Policy Header", "Missing X-Frame-Options Header",
  //        "Missing X-Content-Type-Options Header", "Missing Content-Security-Policy Header"
  async headers() {
    return [
      {
        source: "/(.*)", // apply to ALL pages
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // NOTE: Adjust this policy to match any third-party scripts/fonts you load.
            // If you use Google Fonts, add: style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "img-src * data: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "connect-src 'self' *",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
