import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core", "puppeteer", "cheerio"],
};

export default nextConfig;
