/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    // Only add the rewrite if NEXT_PUBLIC_API_URL is defined
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && apiUrl !== 'undefined') {
      return [
        {
          source: '/api/:path*',
          destination: apiUrl + '/api/:path*',
        },
      ];
    }
    // Return empty array if no API URL is defined or is 'undefined'
    return [];
  },
};

module.exports = nextConfig;
