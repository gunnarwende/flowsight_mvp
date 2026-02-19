const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(process.cwd(), ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const l = line.trim();
  if (!l || l.startsWith("#")) continue;
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[m[1]] = v;
}

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in src/web/.env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  const slug = "default";

  const sel = await supabase.from("tenants").select("id,slug").eq("slug", slug).limit(1);
  if (sel.error) { console.error("Select error:", sel.error.message); process.exit(1); }
  if (sel.data && sel.data.length > 0) { console.log(sel.data[0].id); return; }

  const ins = await supabase.from("tenants").insert({ slug, name: "Default Tenant" }).select("id,slug").limit(1);
  if (ins.error) {
    const again = await supabase.from("tenants").select("id,slug").eq("slug", slug).limit(1);
    if (again.error || !again.data || again.data.length === 0) { console.error("Insert error:", ins.error.message); process.exit(1); }
    console.log(again.data[0].id); return;
  }
  console.log(ins.data[0].id);
})();
