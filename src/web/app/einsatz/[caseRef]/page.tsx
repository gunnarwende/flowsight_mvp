import { notFound } from "next/navigation";
import { getServiceClient } from "@/src/lib/supabase/server";
import { validateEinsatzToken } from "@/src/lib/sms/verifySmsToken";
import { resolveTenantIdentityById } from "@/src/lib/tenants/resolveTenantIdentity";
import { EinsatzSurface } from "./EinsatzSurface";

// ---------------------------------------------------------------------------
// /einsatz/[caseRef]?t=[token]
// Technician mobile surface — no login required, HMAC-secured.
// Shows: address, problem, maps link, status buttons, photo upload.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ caseRef: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function EinsatzPage({ params, searchParams }: Props) {
  const { caseRef } = await params;
  const { t: token } = await searchParams;

  if (!token || !caseRef) return notFound();

  // Parse caseRef (format: "WB-0042")
  const match = caseRef.match(/^([A-Z]{1,4})-(\d+)$/i);
  if (!match) return notFound();

  const prefix = match[1].toUpperCase();
  const seqNumber = parseInt(match[2], 10);

  const supabase = getServiceClient();

  // Look up case by prefix + seq_number
  const { data: row } = await supabase
    .from("cases")
    .select("id, tenant_id, created_at, status, category, urgency, description, street, house_number, plz, city, reporter_name, contact_phone, scheduled_at, scheduled_end_at, assignee_text")
    .eq("seq_number", seqNumber)
    .single();

  if (!row) return notFound();

  // Validate HMAC token
  if (!validateEinsatzToken(row.id, row.created_at, token)) {
    return notFound();
  }

  // Verify prefix matches tenant
  const identity = await resolveTenantIdentityById(row.tenant_id);
  if (!identity || identity.caseIdPrefix?.toUpperCase() !== prefix) {
    return notFound();
  }

  const caseLabel = `${prefix}-${String(seqNumber).padStart(4, "0")}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <EinsatzSurface
        caseId={row.id}
        caseLabel={caseLabel}
        tenantName={identity.displayName}
        brandColor={identity.primaryColor ?? "#1e293b"}
        status={row.status}
        category={row.category}
        urgency={row.urgency}
        description={row.description}
        street={row.street}
        houseNumber={row.house_number}
        plz={row.plz}
        city={row.city}
        reporterName={row.reporter_name}
        contactPhone={row.contact_phone}
        scheduledAt={row.scheduled_at}
        scheduledEndAt={row.scheduled_end_at}
        assigneeText={row.assignee_text}
        token={token}
        caseRef={caseRef}
      />
    </div>
  );
}
