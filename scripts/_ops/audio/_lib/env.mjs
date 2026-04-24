// Loads .env.local from src/web/.env.local for audio scripts.
// Keeps one single source so scripts never need to know the path.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
const envPath = path.join(repoRoot, "src", "web", ".env.local");

export function loadEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error(`env not found: ${envPath}`);
  }
  const txt = fs.readFileSync(envPath, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const [, k, rawV] = m;
    const v = rawV.replace(/^"|"$/g, "");
    if (!(k in process.env) || process.env[k] === "") {
      process.env[k] = v;
    }
  }
  return process.env;
}

export const REPO_ROOT = repoRoot;
export const PIPELINE_ROOT = path.join(repoRoot, "docs", "gtm", "pipeline", "06_video_production");
export const MINI_TAKES = path.join(PIPELINE_ROOT, "mini_takes");
export const MASTER_TAKES = path.join(PIPELINE_ROOT, "master_takes");
export const CLEAN_ROOT = path.join(PIPELINE_ROOT, "_clean");
export const GENERATED = path.join(PIPELINE_ROOT, "_generated");
export const TENANTS_ROOT = path.join(repoRoot, "docs", "customers");
