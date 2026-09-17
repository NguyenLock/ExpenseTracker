import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(frontendRoot, "..");

const nextConfig: NextConfig = {
  turbopack: {
    // Workspace deps are hoisted to the monorepo root.
    root: monorepoRoot,
  },
};

export default nextConfig;
