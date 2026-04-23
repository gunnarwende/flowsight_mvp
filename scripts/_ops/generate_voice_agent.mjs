#!/usr/bin/env node
/**
 * generate_voice_agent.mjs — Generate Voice Agent JSON from tenant_config.json + template.
 *
 * Reads the pipeline template, replaces all {{placeholders}} with values from
 * tenant_config.json, and writes the customer-specific agent JSON.
 *
 * Usage:
 *   node scripts/_ops/generate_voice_agent.mjs --slug stark-haustechnik
 *
 * Input:
 *   docs/customers/{slug}/tenant_config.json
 *   docs/gtm/pipeline/05_provision/voice_agent_template_de.json
 *   retell/templates/global_prompt_de.txt
 *
 * Output:
 *   docs/customers/{slug}/voice_agent_de.json
 *   (optionally also retell/exports/{slug}_agent.json for retell_sync compatibility)
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// ── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const slug = getArg("--slug");
const dryRun = args.includes("--dry-run");

if (!slug) {
  console.error("Usage: node scripts/_ops/generate_voice_agent.mjs --slug <slug> [--dry-run]");
  process.exit(1);
}

// ── Paths ────────────────────────────────────────────────────────────────
const configPath = join("docs", "customers", slug, "tenant_config.json");
const templatePath = join("docs", "gtm", "pipeline", "05_provision", "voice_agent_template_de.json");
const promptTemplatePath = join("retell", "templates", "global_prompt_de.txt");
const outputPath = join("docs", "customers", slug, "voice_agent_de.json");
const retellExportPath = join("retell", "exports", `${slug.replace(/-/g, "_")}_agent.json`);

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== Generate Voice Agent: ${slug} ===\n`);

  // Read inputs
  const config = JSON.parse(await readFile(configPath, "utf-8"));
  const template = JSON.parse(await readFile(templatePath, "utf-8"));
  const promptTemplate = await readFile(promptTemplatePath, "utf-8");

  const va = config.voice_agent;
  if (!va) {
    console.error("ERROR: tenant_config.json has no voice_agent section");
    process.exit(1);
  }

  // ── Build placeholder map ──────────────────────────────────────────────
  const categories = va.categories || "Allgemein";
  const categoriesPipe = Array.isArray(categories) ? categories.join(" | ") : categories;
  const categoriesQuoted = Array.isArray(categories)
    ? categories.map((c) => `"${c}"`).join(", ")
    : `"${categories}"`;

  const placeholders = {
    company_name: va.company_name || config.tenant?.name || "",
    domain: va.domain || "",
    owner_names: va.owner_names || "",
    address: va.address || "",
    phone: va.phone || "",
    email: va.email || "",
    website: va.website || "",
    founded: va.founded || "",
    team_section: va.team_section || "",
    memberships: va.memberships || "",
    google_rating: va.google_rating || "",
    opening_hours: va.opening_hours || "",
    opening_hours_spoken: va.opening_hours_spoken || "",
    emergency_policy: va.emergency_policy || "",
    services_list: va.services_list || "",
    service_area: va.service_area || "",
    service_area_spoken: va.service_area_spoken || "",
    price_section: va.price_section || "",
    price_deflect: va.price_deflect || "Für eine genaue Einschätzung schauen sich unsere Techniker das am liebsten vor Ort an. Soll ich Ihre Kontaktdaten aufnehmen?",
    jobs_section: va.jobs_section || "",
    jobs_spoken: va.jobs_spoken || "Aktuell haben wir keine offenen Stellen. Schauen Sie aber gerne auf unserer Website vorbei.",
    address_spoken: va.address_spoken || "",
    categories: categoriesPipe,
    categories_quoted: categoriesQuoted,
    intl_agent_id: "", // filled by retell_sync.mjs during publish
  };

  // ── Replace placeholders in global prompt ──────────────────────────────
  let globalPrompt = promptTemplate;
  for (const [key, value] of Object.entries(placeholders)) {
    globalPrompt = globalPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  // ── Replace placeholders in template JSON ──────────────────────────────
  let templateStr = JSON.stringify(template);

  // Special: inject global prompt (escape for JSON string)
  const escapedPrompt = globalPrompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  templateStr = templateStr.replace("{{GLOBAL_PROMPT}}", escapedPrompt);

  // Replace all other placeholders
  for (const [key, value] of Object.entries(placeholders)) {
    const safeValue = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    templateStr = templateStr.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), safeValue);
  }

  const agentJson = JSON.parse(templateStr);

  // ── Remove template metadata ───────────────────────────────────────────
  delete agentJson._template_version;
  delete agentJson._description;

  // ── Log summary ────────────────────────────────────────────────────────
  console.log(`  Company: ${placeholders.company_name}`);
  console.log(`  Domain: ${placeholders.domain}`);
  console.log(`  Categories: ${categoriesPipe}`);
  console.log(`  Phone: ${placeholders.phone}`);
  console.log(`  Email: ${placeholders.email}`);
  console.log(`  Global prompt: ${globalPrompt.length} chars`);
  console.log(`  Nodes: ${agentJson.conversationFlow?.nodes?.length || 0}`);

  // Check for remaining placeholders in final output (not template metadata)
  const finalStr = JSON.stringify(agentJson);
  const remaining = finalStr.match(/\{\{[a-z_]+\}\}/g);
  if (remaining) {
    const unique = [...new Set(remaining)];
    console.log(`\n  WARNING: ${unique.length} unresolved placeholders: ${unique.join(", ")}`);
  } else {
    console.log(`\n  All placeholders resolved ✓`);
  }

  if (dryRun) {
    console.log("\n  [DRY RUN] Would write to:");
    console.log(`    ${outputPath}`);
    console.log(`    ${retellExportPath}`);
    return;
  }

  // ── Write output ───────────────────────────────────────────────────────
  await writeFile(outputPath, JSON.stringify(agentJson, null, 2), "utf-8");
  console.log(`\n  Saved: ${outputPath}`);

  // Also write to retell/exports/ for retell_sync.mjs compatibility
  await writeFile(retellExportPath, JSON.stringify(agentJson, null, 2), "utf-8");
  console.log(`  Saved: ${retellExportPath}`);

  console.log(`\n  Next: node --env-file=src/web/.env.local scripts/_ops/retell_sync.mjs --prefix ${slug.replace(/-/g, "_")}`);
  console.log("=== Done ===\n");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
