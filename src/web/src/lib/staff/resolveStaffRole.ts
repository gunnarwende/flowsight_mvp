import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

export interface StaffContext {
  staffId: string;
  displayName: string;
  role: "admin" | "techniker";
  email: string;
}

/**
 * Resolve staff role from user email + tenant ID.
 * Returns null if no matching staff record found (backwards compatible = full access).
 */
export async function resolveStaffRole(
  userEmail: string,
  tenantId: string,
): Promise<StaffContext | null> {
  if (!userEmail || !tenantId) return null;

  const supabase = getServiceClient();
  const { data } = await supabase
    .from("staff")
    .select("id, display_name, role, email")
    .eq("tenant_id", tenantId)
    .eq("email", userEmail)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    staffId: data.id,
    displayName: data.display_name,
    role: data.role === "techniker" ? "techniker" : "admin",
    email: data.email,
  };
}
