// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-leaflet/core": path.resolve(
        __dirname,
        "node_modules/@react-leaflet/core",
      ),
    };
    return config;
  },
};

export default nextConfig;
