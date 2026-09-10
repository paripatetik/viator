/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the server DOM parser in Node.js; bundling its DOM dependencies breaks them.
  serverExternalPackages: ['linkedom'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.viator.com.ua',
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;
