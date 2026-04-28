#!/usr/bin/env node
/**
 * run_pipeline_multi.mjs — S3 Multi-Tenant Pipeline Runner.
 *
 * Fährt die komplette Pipeline (Take 2 + Take 3 + Take 4) für N Tenants mit
 * konfigurierbarer Parallelität. Skaliert auf 10 Betriebe/Tag indem Tenants
 * in Batches à `parallel` gleichzeitig laufen.
 *
 * Usage:
 *   node --env-file=src/web/.env.local scripts/_ops/run_pipeline_multi.mjs \
 *     --slugs=leins-ag,waelti-sohn-ag,stark-haustechnik \
 *     --takes=all \
 *     --parallel=2 \
 *     --speed=normal
 *
 * Flags:
 *   --slugs      Komma-Liste der Tenants (Pflicht)
 *   --takes      "2", "3", "4" oder Komma-Kombi wie "2,3,4" oder "all" (Default: "all")
 *   --parallel   Anzahl paralleler Tenants pro Take (Default: 2)
 *   --speed      "fast", "normal", "demo" (nur record_take4.mjs)
 *   --qg         "true|false" — Quality-Gates nach jedem Take (Default: true)
 *
 * Strategy:
 *   - Ensure shared assets ONCE (bezel, masks, etc.)
 *   - Per take, run batches of N slugs in parallel
 *   - Nach jedem Batch: QG-Check
 *   - Final: Summary-Report (PASS/FAIL pro Tenant)
 */

import { spawn } from "node:child_process";
import { ensureAllSharedAssets } from "./_lib/shared_assets.mjs";

const args = process.argv.slice(2);
const slugsArg = args.find((a) => a.startsWith("--slugs"))?.split("=")[1] || "";
const takesArg = args.find((a) => a.startsWith("--takes"))?.split("=")[1] || "all";
const parallel = parseInt(args.find((a) => a.startsWith("--parallel"))?.split("=")[1] || "2", 10);
const speed = args.find((a) => a.startsWith("--speed"))?.split("=")[1] || "normal";
const qgEnabled = args.find((a) => a.startsWith("--qg"))?.split("=")[1] !== "false";

const slugs = slugsArg.split(",").map((s) => s.trim()).filter(Boolean);
const takes = takesArg === "all" ? ["2", "3", "4"] : takesArg.split(",").map((s) => s.trim());

if (slugs.length === 0) {
  console.error("ERROR: --slugs is required, e.g. --slugs=leins-ag,waelti-sohn-ag");
  process.exit(1);
}

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║  MULTI-TENANT PIPELINE RUNNER                              ║`);
console.log(`║  Tenants: ${slugs.join(", ").padEnd(49)} ║`);
console.log(`║  Takes:   ${takes.join(", ").padEnd(49)} ║`);
console.log(`║  Parallel: ${String(parallel).padEnd(48)} ║`);
console.log(`║  Speed:    ${speed.padEnd(48)} ║`);
console.log(`╚════════════════════════════════════════════════════════════╝`);

// Ensure shared assets ONCE (saves per-tenant regeneration)
console.log(`\n── Shared Assets ──`);
await ensureAllSharedAssets();
console.log(`✓ Shared assets ready in _shared/`);

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
function runCmd(cmd, args, label) {
  return new Promise((resolve) => {
    const start = Date.now();
    const ps = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      env: { ...process.env },
    });
    let stderr = "";
    ps.stdout.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.includes("✓") || line.includes("✅") || line.includes("❌") ||
            line.includes("STEP") || line.includes("Patched") ||
            line.includes("PIPELINE COMPLETE") || line.includes("===")) {
          console.log(`  [${label}] ${line.trim()}`);
        }
      }
    });
    ps.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    ps.on("close", (code) => {
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      resolve({ code, secs, stderr });
    });
  });
}

async function runInBatches(items, parallelism, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += parallelism) {
    const batch = items.slice(i, i + parallelism);
    console.log(`\n  Batch ${Math.floor(i / parallelism) + 1}/${Math.ceil(items.length / parallelism)}: ${batch.join(", ")}`);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ────────────────────────────────────────────────────────────────
// Per-Take runner
// ────────────────────────────────────────────────────────────────
async function runTakeForSlug(take, slug) {
  const label = `${slug}/T${take}`;
  const argsList = [
    "--env-file=src/web/.env.local",
    "scripts/_ops/pipeline_screenflow.mjs",
    `--slug=${slug}`,
    `--take=${take}`,
  ];
  const { code, secs } = await runCmd(process.execPath, argsList, label);
  const ok = code === 0;
  console.log(`  [${label}] ${ok ? "✅" : "❌"} Take ${take} (${secs}s)`);
  return { slug, take, ok, secs };
}

async function runQGForSlug(slug, take) {
  const label = `${slug}/QG${take}`;
  const argsList = [
    "--env-file=src/web/.env.local",
    "scripts/_ops/dry_run_qg.mjs",
    `--slug=${slug}`,
    `--take=${take}`,
  ];
  const { code } = await runCmd(process.execPath, argsList, label);
  return { slug, take, ok: code === 0 };
}

// ────────────────────────────────────────────────────────────────
// MAIN: Per Take → runs in batches of N
// ────────────────────────────────────────────────────────────────
const startAll = Date.now();
const results = [];
for (const take of takes) {
  console.log(`\n╔═══ TAKE ${take} ═══════════════════════════════════════════════╗`);
  const takeResults = await runInBatches(slugs, parallel, (slug) => runTakeForSlug(take, slug));
  results.push(...takeResults);

  if (qgEnabled) {
    console.log(`\n── QG Check Take ${take} ──`);
    for (const slug of slugs) {
      await runQGForSlug(slug, take);
    }
  }
}

// ────────────────────────────────────────────────────────────────
// Final Summary
// ────────────────────────────────────────────────────────────────
const totalSecs = ((Date.now() - startAll) / 1000).toFixed(0);
console.log(`\n╔═══ SUMMARY ═══════════════════════════════════════════════╗`);
console.log(`║  Total: ${totalSecs}s = ${(totalSecs / 60).toFixed(1)} min${" ".repeat(40)}║`);
console.log(`╠════════════════════════════════════════════════════════════╣`);
for (const r of results) {
  const icon = r.ok ? "✅" : "❌";
  console.log(`║  ${icon} ${r.slug.padEnd(24)} T${r.take}  ${r.secs}s`.padEnd(60) + "║");
}
console.log(`╚════════════════════════════════════════════════════════════╝`);

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.log(`\n❌ ${failed.length} Failures:`);
  for (const f of failed) console.log(`   - ${f.slug} Take ${f.take}`);
  process.exit(1);
}
console.log(`\n✅ ALL TAKES PASSED for ${slugs.length} tenants in ${totalSecs}s`);
