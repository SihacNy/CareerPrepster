/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@careerprepster/shared"],
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
};

export default nextConfig;
