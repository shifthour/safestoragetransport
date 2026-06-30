import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The app is deployed under a sub-path on the cPanel host. basePath makes Next
  // serve all assets/_next, pages and proxy path-matching under this prefix.
  // Raw fetch()/<a href>/<img src> are handled separately via lib/base.ts + the
  // fetch shim in app/layout.tsx.
  basePath: "/safestorage-transport",
};

export default nextConfig;
