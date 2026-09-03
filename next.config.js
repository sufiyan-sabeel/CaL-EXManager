/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === 'true';
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    unoptimized: true,
  },
  ...(isExport
    ? {
        output: 'export',
        basePath: '/CaL-EXManager',
        assetPrefix: '/CaL-EXManager/',
      }
    : {}),
  trailingSlash: true,
};

module.exports = nextConfig;
