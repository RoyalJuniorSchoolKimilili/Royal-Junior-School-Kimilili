import type { NextConfig } from "next";

const repoName = "Royal-Junior-School-Kimilili";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isProduction ? { basePath: `/${repoName}` } : {}),
};

export default nextConfig;
