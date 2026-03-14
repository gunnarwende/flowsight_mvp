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
  /** Case ID prefix, e.g. "WB" */
  caseIdPrefix: string;
  /** Primary brand color hex, e.g. "#d4a853" */
  primaryColor: string;
  /** Tenant ID */
  tenantId: string;
}

const FALLBACK: Omit<TenantIdentity, "tenantId"> = {
  displayName: "FlowSight",
  shortName: "FlowSight",
  caseIdPrefix: "FS",
  primaryColor: "#d4a853",
};

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
        return {
          tenantId: data.id,
          displayName: data.name,
          shortName:
            typeof modules?.sms_sender_name === "string"
              ? modules.sms_sender_name
              : data.name,
          caseIdPrefix: data.case_id_prefix ?? "FS",
          primaryColor:
            typeof modules?.primary_color === "string"
              ? modules.primary_color
              : FALLBACK.primaryColor,
        };
      }
    }

    // Fallback: pick first tenant (admin without tenant_id, or single-tenant MVP).
    // Admin sees all cases via RLS anyway — this just provides branding context.
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id, name, slug, case_id_prefix, modules")
      .order("created_at", { ascending: true })
      .limit(1);

    if (tenants && tenants.length === 1) {
      const t = tenants[0];
      const modules = t.modules as Record<string, unknown> | null;
      return {
        tenantId: t.id,
        displayName: t.name,
        shortName:
          typeof modules?.sms_sender_name === "string"
            ? modules.sms_sender_name
            : t.name,
        caseIdPrefix: t.case_id_prefix ?? "FS",
        primaryColor:
          typeof modules?.primary_color === "string"
            ? modules.primary_color
            : FALLBACK.primaryColor,
      };
    }

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
    return {
      tenantId: data.id,
      displayName: data.name,
      shortName:
        typeof modules?.sms_sender_name === "string"
          ? modules.sms_sender_name
          : data.name,
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
