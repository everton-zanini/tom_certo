import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Vercel rejects deployment ids longer than 32 characters (a full git SHA has 40).
const MAX_DEPLOYMENT_ID_LENGTH = 32;

// Without an id (no env, no git) the update notice stays off instead of comparing mismatched ids.
function resolveBuildId(): string | undefined {
  const fromEnv = process.env.NEXT_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, MAX_DEPLOYMENT_ID_LENGTH);
  try {
    const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] });
    return sha.toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

const buildId = resolveBuildId();

const nextConfig: NextConfig = {
  ...(buildId && { deploymentId: buildId, env: { NEXT_PUBLIC_BUILD_ID: buildId } }),
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
