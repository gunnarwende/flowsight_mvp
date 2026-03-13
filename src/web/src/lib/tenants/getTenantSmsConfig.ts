import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

export interface TenantSmsConfig {
  senderName: string;
  /** Tenant's Twilio phone number (E.164). Used as SMS sender to avoid spam filters. */
  fromNumber: string | null;
}

/**
 * Read SMS config from the tenant's `modules` JSONB + first active phone number.
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

    // Fetch tenant's Twilio number for use as SMS sender (avoids spam filters)
    let fromNumber: string | null = null;
    const { data: numRow } = await supabase
      .from("tenant_numbers")
      .select("phone_number")
      .eq("tenant_id", tenantId)
      .eq("active", true)
      .limit(1)
      .single();
    if (numRow?.phone_number) {
      fromNumber = numRow.phone_number;
    }

    return { senderName, fromNumber };
  } catch {
    return null;
  }
}
