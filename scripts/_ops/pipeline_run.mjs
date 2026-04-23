#!/usr/bin/env node
/**
 * pipeline_run.mjs — Gold-Contact-Pipeline Orchestrator
 *
 * Ein Befehl. Ein JSON. Alles fliesst.
 *
 * Modes:
 *   Full run (URL → Config):
 *     node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
 *       --url https://www.stark-haustechnik.ch --slug stark-haustechnik
 *
 *   Continue from provision:
 *     node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
 *       --slug stark-haustechnik --from provision
 *
 *   Single step:
 *     node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
 *       --slug stark-haustechnik --step crawl|derive|provision|video|outreach
 *
 * Pipeline Steps:
 *   1. CRAWL — crawl_extract.mjs → crawl_extract.json
 *   2. DERIVE — derive_config.mjs → tenant_config.json + founder_review.md
 *   3. ──── STOP: Founder Review (3-5 Items) ────
 *   4. PROVISION — provision_from_config.mjs → Tenant + Voice + Seed
 *   5. VIDEO — produce_videos.mjs → 4 Takes (TODO)
 *   6. OUTREACH — send_outreach.mjs → E-Mail mit Videos (TODO)
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith("--")) return args[idx + 1];
  const prefix = `--${name}=`;
  const arg = args.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

const inputUrl = getArg("url");
const slug = getArg("slug");
const fromStep = getArg("from");
const singleStep = getArg("step");
const dryRun = args.includes("--dry-run");

if (!slug) {
  console.error(`
Gold-Contact-Pipeline — Orchestrator

Usage:
  # Full run (URL → Config → STOP for Founder Review):
  node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \\
    --url https://www.example.ch --slug example-ag

  # Continue after Founder Review:
  node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \\
    --slug example-ag --from provision

  # Single step:
  node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \\
    --slug example-ag --step crawl|derive|provision|video|outreach

  [--dry-run]
`);
  process.exit(1);
}

const envFlag = "--env-file=src/web/.env.local";
const customerDir = join("docs", "customers", slug);

// ── Helper ───────────────────────────────────────────────────────────────
function run(cmd, label) {
  console.log(`\n${"━".repeat(60)}`);
  console.log(`  ${label}`);
  console.log("━".repeat(60) + "\n");
  try {
    execSync(cmd, { cwd: process.cwd(), stdio: "inherit" });
    return true;
  } catch (err) {
    console.error(`\n  ✗ ${label} FAILED: ${err.message}\n`);
    return false;
  }
}

function fileExists(path) {
  return existsSync(path);
}

// ── Step definitions ─────────────────────────────────────────────────────
const STEPS = {
  crawl: {
    label: "Step 1: Crawl + Extract",
    needs: () => {
      if (!inputUrl) { console.error("  --url required for crawl step"); return false; }
      return true;
    },
    run: () => run(
      `node ${envFlag} scripts/_ops/crawl_extract.mjs --url ${inputUrl} --slug ${slug}`,
      "Crawl + Extract + Zefix"
    ),
    output: join(customerDir, "crawl_extract.json"),
  },

  derive: {
    label: "Step 2: Derive Config",
    needs: () => {
      if (!fileExists(join(customerDir, "crawl_extract.json"))) {
        console.error(`  Missing: ${join(customerDir, "crawl_extract.json")} — run crawl first`);
        return false;
      }
      return true;
    },
    run: () => run(
      `node scripts/_ops/derive_config.mjs --slug ${slug}`,
      "Derive Config (tenant_config.json)"
    ),
    output: join(customerDir, "tenant_config.json"),
  },

  provision: {
    label: "Step 4: Provision (Tenant + Voice + Seed)",
    needs: () => {
      if (!fileExists(join(customerDir, "tenant_config.json"))) {
        console.error(`  Missing: ${join(customerDir, "tenant_config.json")} — run derive first`);
        return false;
      }
      return true;
    },
    run: () => run(
      `node ${envFlag} scripts/_ops/provision_from_config.mjs --slug=${slug}${dryRun ? " --dry-run" : ""}`,
      "Provision from Config"
    ),
  },

  video: {
    label: "Step 5: Video Production",
    needs: () => {
      if (!fileExists(join(customerDir, "tenant_config.json"))) {
        console.error(`  Missing: tenant_config.json`);
        return false;
      }
      return true;
    },
    run: () => {
      console.log("  TODO: produce_videos.mjs (Samsung + Leitsystem + STS + Assembly)");
      console.log("  This step will be built in Phase 2 of the pipeline.");
      return true;
    },
  },

  outreach: {
    label: "Step 6: Outreach",
    needs: () => {
      if (!fileExists(join(customerDir, "tenant_config.json"))) {
        console.error(`  Missing: tenant_config.json`);
        return false;
      }
      return true;
    },
    run: () => {
      console.log("  TODO: send_outreach.mjs (E-Mail mit 4 Takes)");
      console.log("  This step will be built in Phase 3 of the pipeline.");
      return true;
    },
  },
};

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  GOLD-CONTACT-PIPELINE");
  console.log("═".repeat(60));
  console.log(`  Slug:  ${slug}`);
  if (inputUrl) console.log(`  URL:   ${inputUrl}`);
  if (singleStep) console.log(`  Step:  ${singleStep}`);
  if (fromStep) console.log(`  From:  ${fromStep}`);
  if (dryRun) console.log("  Mode:  DRY RUN");
  console.log("═".repeat(60));

  // ── Single step mode ───────────────────────────────────────────────
  if (singleStep) {
    const step = STEPS[singleStep];
    if (!step) {
      console.error(`Unknown step: ${singleStep}. Available: ${Object.keys(STEPS).join(", ")}`);
      process.exit(1);
    }
    if (!step.needs()) process.exit(1);
    const ok = step.run();
    process.exit(ok ? 0 : 1);
  }

  // ── Continue from step mode ────────────────────────────────────────
  if (fromStep) {
    const stepOrder = ["provision", "video", "outreach"];
    const startIdx = stepOrder.indexOf(fromStep);
    if (startIdx === -1) {
      console.error(`Unknown --from step: ${fromStep}. Available: ${stepOrder.join(", ")}`);
      process.exit(1);
    }

    // Validate config exists
    if (!fileExists(join(customerDir, "tenant_config.json"))) {
      console.error(`Missing: ${join(customerDir, "tenant_config.json")}`);
      console.error("Run the full pipeline first (--url + --slug), then Founder Review, then --from provision");
      process.exit(1);
    }

    // Validate config (check for founder_confirm values)
    const config = JSON.parse(await readFile(join(customerDir, "tenant_config.json"), "utf-8"));
    const configStr = JSON.stringify(config);
    if (configStr.includes('"founder_confirm"') && fromStep === "provision") {
      console.error("\n  ✗ tenant_config.json still has 'founder_confirm' values.");
      console.error("  Please complete Founder Review first.");
      console.error(`  Check: ${join(customerDir, "founder_review.md")}\n`);
      process.exit(1);
    }

    for (let i = startIdx; i < stepOrder.length; i++) {
      const stepKey = stepOrder[i];
      const step = STEPS[stepKey];
      if (!step.needs()) process.exit(1);
      const ok = step.run();
      if (!ok) process.exit(1);
    }

    console.log("\n" + "═".repeat(60));
    console.log("  PIPELINE COMPLETE");
    console.log("═".repeat(60) + "\n");
    return;
  }

  // ── Full run mode (URL → Derive → STOP) ───────────────────────────
  if (!inputUrl) {
    console.error("  --url required for full pipeline run");
    console.error("  Or use --from provision / --step <step> for partial runs");
    process.exit(1);
  }

  // Step 1: Crawl
  if (!STEPS.crawl.needs()) process.exit(1);
  if (!STEPS.crawl.run()) process.exit(1);

  // Step 2: Derive
  if (!STEPS.derive.needs()) process.exit(1);
  if (!STEPS.derive.run()) process.exit(1);

  // ── STOP: Founder Review ───────────────────────────────────────────
  const reviewPath = join(customerDir, "founder_review.md");
  const configExists = fileExists(join(customerDir, "tenant_config.json"));

  console.log("\n" + "═".repeat(60));
  console.log("  PIPELINE PAUSED — FOUNDER REVIEW NEEDED");
  console.log("═".repeat(60));
  console.log(`\n  ✓ crawl_extract.json → ${join(customerDir, "crawl_extract.json")}`);
  console.log(`  ✓ tenant_config.json → ${join(customerDir, "tenant_config.json")}`);
  if (fileExists(reviewPath)) {
    console.log(`  → founder_review.md → ${reviewPath}`);
  }
  console.log(`\n  Nächste Schritte:`);
  console.log(`  1. Founder: founder_review.md öffnen und offene Punkte befüllen`);
  console.log(`  2. tenant_config.json aktualisieren (prospect.email etc.)`);
  console.log(`  3. Weiter mit:`);
  console.log(`     node ${envFlag} scripts/_ops/pipeline_run.mjs --slug ${slug} --from provision`);
  console.log("═".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
