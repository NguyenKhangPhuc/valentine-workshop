import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép Next.js tải ảnh từ IP nội bộ
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1', // Thay vì localhost, hãy dùng IP cụ thể
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'vppatwwxdwxfkmoensot.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.ikapo.fi',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/aida-public/**',
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;