/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
