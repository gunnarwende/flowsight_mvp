import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

export interface TenantSmsConfig {
  senderName: string;
}

/**
 * Read SMS config from the tenant's `modules` JSONB.
 * Returns null if sms is not enabled or sms_sender_name is missing.
 * Never throws.
 */
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
