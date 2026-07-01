#!/usr/bin/env node
/**
 * _hero_backup_cases.mjs — READ-ONLY Backup der cases + case_events eines Tenants
 * VOR dem destruktiven Screenflow-Seed. Schreibt nach production/_case_backups/
 * (gitignored). Kein Schreibzugriff auf die DB.
 *
 * Usage: node --env-file=src/web/.env.local scripts/_ops/_hero_backup_cases.mjs --slug doerfler-ag
 */
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { createClient } = require("../../src/web/node_modules/@supabase/supabase-js/dist/index.cjs");

const args = process.argv.slice(2);
const slug = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : "doerfler-ag";
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: tenant } = await sb.from("tenants").select("id,name,slug").eq("slug", slug).single();
if (!tenant) { console.error("tenant not found"); process.exit(1); }

const { data: cases, error } = await sb.from("cases").select("*").eq("tenant_id", tenant.id);
if (error) { console.error(error.message); process.exit(1); }
const ids = cases.map((c) => c.id);
let events = [];
if (ids.length) {
  const { data: ev } = await sb.from("case_events").select("*").in("case_id", ids);
  events = ev || [];
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = "production/_case_backups";
fs.mkdirSync(dir, { recursive: true });
const out = `${dir}/${slug}_${stamp}.json`;
fs.writeFileSync(out, JSON.stringify({ tenant, count: cases.length, cases, events }, null, 2));

// Status breakdown
const byStatus = {}; let newCount = 0;
for (const c of cases) { byStatus[c.status] = (byStatus[c.status] || 0) + 1; if (c.status === "new") newCount++; }
console.log(`BACKUP ${slug}: ${cases.length} cases, ${events.length} events -> ${out}`);
console.log(`STATUS:`, JSON.stringify(byStatus));
console.log(`NEU(new)=${newCount}`);
