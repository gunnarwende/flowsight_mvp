import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * Returns the alphanumeric sender name for eCall SMS.
 * Fallback to ECALL_SENDER_NUMBER is handled by sendSmsEcall.ts.
 * Returns null if sms is not enabled or sms_sender_name is missing.
 * Never throws.
 */
export interface TenantSmsConfig {
  senderName: string;
}

export async function getTenantSmsConfig(
  tenantId: string,
): Promise<TenantSmsConfig | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("modules")
      .eq("id", tenantId)
      .single();

    if (error || !data) return null;

    const modules = data.modules as Record<string, unknown> | null;
    if (!modules) return null;

    if (modules.sms !== true) return null;

    const senderName = modules.sms_sender_name;
    if (typeof senderName !== "string" || senderName.length === 0) return null;

    return { senderName };
  } catch {
    return null;
  }
}
