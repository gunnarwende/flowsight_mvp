import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath) {
  const txt = fs.readFileSync(filePath, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const envPath = path.resolve(process.cwd(), "src", "web", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing src/web/.env.local");
  process.exit(1);
}
loadEnvFile(envPath);

const org = process.env.SENTRY_ORG;
const project = process.env.SENTRY_PROJECT;
const token = process.env.SENTRY_AUTH_TOKEN;

if (!org || !project || !token) {
  console.error("Missing SENTRY_* env vars after loading .env.local");
  process.exit(1);
}

const base = "https://sentry.io/api/0";
const headers = { Authorization: `Bearer ${token}` };

const queries = [
  'endpoint:"/api/retell/webhook"',
  'message:"payload_keys"',
  'message:"Retell webhook"',
];

async function fetchIssues(q) {
  const url = new URL(`${base}/projects/${org}/${project}/issues/`);
  url.searchParams.set("query", q);
  url.searchParams.set("limit", "10");
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.log(`Query: ${q} -> API ${res.status}`);
    return [];
  }
  return await res.json();
}

async function run() {
  const seen = new Set();
  const uniq = [];

  for (const q of queries) {
    const issues = await fetchIssues(q);
    console.log(`Query: ${q} -> ${issues.length} issues`);
    for (const it of issues) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      uniq.push({ id: it.id, shortId: it.shortId, title: it.title, lastSeen: it.lastSeen, count: it.count });
    }
  }

  console.log("Unique issues (up to 20):");
  for (const it of uniq.slice(0, 20)) console.log(JSON.stringify(it));
}

run().catch(err => {
  console.error("Sentry script failed:", err?.message || err);
  process.exit(1);
});
