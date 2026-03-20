import { TenantDeepDive } from "@/src/components/ceo/TenantDeepDive";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenantDeepDive tenantId={id} />;
}
