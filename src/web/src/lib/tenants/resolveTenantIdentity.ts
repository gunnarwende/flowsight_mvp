import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Tenant identity fields used across Leitstand, E-Mails, Wizard, Review.
 * Central resolution — Identity Contract compliance.
 */
export interface TenantIdentity {
  /** Full legal name, e.g. "Jul. Weinberger AG" */
  displayName: string;
  /** Short brand name for UI, e.g. "Weinberger AG" */
  shortName: string;
  /** Brand core name for tab/PWA titles, e.g. "Weinberger" */
  leitsystemName: string;
  /** Case ID prefix, e.g. "WB" */
  caseIdPrefix: string;
  /** Primary brand color hex, e.g. "#d4a853" */
  primaryColor: string;
  /** Tenant ID */
  tenantId: string;
}

const FALLBACK: Omit<TenantIdentity, "tenantId"> = {
  displayName: "Leitstand",
  shortName: "Leitstand",
  leitsystemName: "Leitstand",
  caseIdPrefix: "FS",
  primaryColor: "#64748b", // slate-500 — neutral "no brand set" signal
};

/**
 * Derive a short brand-core name for tab titles and PWA labels.
 * Priority: modules.leitsystem_name → strip legal suffixes from shortName.
 * "Weinberger AG" → "Weinberger", "Walter Leuthold" → "Leuthold"
 */
function deriveLeitsystemName(
  modules: Record<string, unknown> | null,
  shortName: string,
): string {
  // Explicit override wins
  if (typeof modules?.leitsystem_name === "string" && modules.leitsystem_name) {
    return modules.leitsystem_name;
  }
  // Strip common Swiss legal suffixes
  let name = shortName
    .replace(/\s+(&\s+Co\.\s*)?((AG|GmbH|SA|Sàrl|Ltd|KG)\.?)$/i, "")
    .trim();
  // If two words remain and both start uppercase → likely "Firstname Lastname" → take last
  const words = name.split(/\s+/);
  if (words.length >= 2) {
    const allCapitalized = words.every((w) => /^[A-ZÄÖÜa-zäöü]/.test(w));
    if (allCapitalized) {
      // Heuristic: if first word looks like a first name (short, no industry term) → take last
      // Otherwise take first word (brand name like "Brunner Haustechnik" → "Brunner")
      return words[0];
    }
  }
  return name || shortName;
}

/**
 * Resolve tenant identity from user JWT metadata.
 * Used by: Leitstand layout, E-Mail templates, OpsShell.
 *
 * Priority:
 * 1. app_metadata.tenant_id → lookup tenant
 * 2. Single-tenant fallback (early MVP)
 * 3. Hardcoded FlowSight defaults (admin/no tenant)
 */
export async function resolveTenantIdentity(
  user: { app_metadata?: Record<string, unknown> }
): Promise<TenantIdentity | null> {
  try {
    const supabase = getServiceClient();
    const metaTenantId = user.app_metadata?.tenant_id as string | undefined;

    if (metaTenantId) {
      const { data } = await supabase
        .from("tenants")
        .select("id, name, slug, case_id_prefix, modules")
        .eq("id", metaTenantId)
        .single();

      if (data?.name) {
        const modules = data.modules as Record<string, unknown> | null;
        const shortName =
          typeof modules?.sms_sender_name === "string"
            ? modules.sms_sender_name
            : data.name;
        return {
          tenantId: data.id,
          displayName: data.name,
          shortName,
          leitsystemName: deriveLeitsystemName(modules, shortName),
          caseIdPrefix: data.case_id_prefix ?? "FS",
          primaryColor:
            typeof modules?.primary_color === "string"
              ? modules.primary_color
              : FALLBACK.primaryColor,
        };
      }
    }

    // SAFETY: No fallback to "first tenant" — this caused Brunner HT to leak
    // into Weinberger contexts. Admin without tenant_id gets neutral branding.
    // Email routes use resolveTenantIdentityById(case.tenant_id) which is always correct.
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve tenant identity by tenant_id directly (for API routes / webhooks).
 */
export async function resolveTenantIdentityById(
  tenantId: string
): Promise<TenantIdentity | null> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("tenants")
      .select("id, name, slug, case_id_prefix, modules")
      .eq("id", tenantId)
      .single();

    if (!data?.name) return null;

    const modules = data.modules as Record<string, unknown> | null;
    const shortName =
      typeof modules?.sms_sender_name === "string"
        ? modules.sms_sender_name
        : data.name;
    return {
      tenantId: data.id,
      displayName: data.name,
      shortName,
      leitsystemName: deriveLeitsystemName(modules, shortName),
      caseIdPrefix: data.case_id_prefix ?? "FS",
      primaryColor:
        typeof modules?.primary_color === "string"
          ? modules.primary_color
          : FALLBACK.primaryColor,
    };
  } catch {
    return null;
  }
}
