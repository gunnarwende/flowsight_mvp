import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

// GET /api/ops/appointments/check-collision?start=...&end=...&assignee=...&exclude_case=...
// Checks if the assignee(s) already have a case scheduled in the given time window.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const assignee = url.searchParams.get("assignee");
  const excludeCase = url.searchParams.get("exclude_case");

  if (!start || !assignee) {
    return NextResponse.json({ collision: false });
  }

  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ collision: false });
  }

  const supabase = getServiceClient();
  const startDate = new Date(start);

  // Check ±2 hours window around the proposed time
  const windowStart = new Date(startDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(startDate.getTime() + 2 * 60 * 60 * 1000).toISOString();

  // Parse assignee names (comma-separated)
  const names = assignee.split(",").map((n) => n.trim()).filter(Boolean);

  // Query cases with scheduled_at in the window assigned to the same people
  let query = supabase
    .from("cases")
    .select("id, assignee_text, scheduled_at, category")
    .eq("tenant_id", scope.tenantId)
    .gte("scheduled_at", windowStart)
    .lte("scheduled_at", windowEnd)
    .neq("status", "done");

  if (excludeCase) {
    query = query.neq("id", excludeCase);
  }

  const { data: conflicts } = await query;

  if (!conflicts || conflicts.length === 0) {
    return NextResponse.json({ collision: false });
  }

  // Check if any conflict has overlapping assignee names
  for (const c of conflicts) {
    const cNames = (c.assignee_text ?? "").split(",").map((n: string) => n.trim());
    const overlap = names.filter((n) => cNames.includes(n));
    if (overlap.length > 0) {
      const time = new Date(c.scheduled_at!).toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      });
      return NextResponse.json({
        collision: true,
        message: `${overlap.join(", ")} hat bereits einen Termin um ${time} (${c.category})`,
      });
    }
  }

  return NextResponse.json({ collision: false });
}
