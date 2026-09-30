/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@careerprepster/shared"],
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
  // Allow Google OAuth popup to communicate back to the opener window.
  // Without this, Next.js default COOP "same-origin" blocks window.postMessage
  // from the Google accounts popup, causing the sign-in flow to hang.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
