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

    // fromNumber: will be populated once Swiss SMS provider (eCall) is configured.
    // Twilio SIP trunk numbers are NOT SMS-capable — do not use them as sender.
    // Until eCall is live, SMS sends via alphanumeric sender (spam risk accepted).
    const fromNumber: string | null = null;

    return { senderName, fromNumber };
  } catch {
    return null;
  }
}
