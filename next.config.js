/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Render sets PORT env automatically — Next.js picks it up
};

module.exports = nextConfig;
