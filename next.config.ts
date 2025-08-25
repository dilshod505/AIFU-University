import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.domain.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3232",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "13.48.25.109",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "http://10.10.1.251",
        port: "8080",
        // pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3232",
        pathname: "/wallpaperflare-cropped-**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  allowedDevOrigins: [
    "http://192.168.100.10:3000",
    "http://192.168.100.158:3000",
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
