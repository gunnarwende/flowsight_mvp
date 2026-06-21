import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export const dynamic = "force-dynamic";

/** Vom Tool editierbare Lead-Felder (Founder-Hoheit + Anreicherung von Hand). */
const EDITABLE = new Set([
  "status", "entscheider", "rolle", "ma_proxy", "tariff", "inhaber_am_telefon",
  "mail", "telefon", "notiz", "letzter_kontakt", "naechster_schritt", "naechster_am",
]);

/**
 * PATCH /api/ceo/journey/lead
 * Body: { id: string, fields: Record<string, string|null> }
 *
 * Aktualisiert einen Lead in der DB-SSOT (ersetzt die localStorage-Edits des
 * alten HTML). Nur whitelisted Felder; unbekannte werden ignoriert.
 */
export async function PATCH(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: string; fields?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.id || !body.fields) {
    return NextResponse.json({ error: "id + fields required" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(body.fields)) {
    if (EDITABLE.has(k)) {
      const s = typeof v === "string" ? v.trim() : v;
      update[k] = s === "" ? null : s;
    }
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("leads").update(update).eq("id", body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
