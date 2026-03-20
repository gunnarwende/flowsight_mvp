import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAccessToken, getFreeBusy } from "@/src/lib/calendar/outlookClient";

// GET /api/ops/appointments/check-collision?start=...&end=...&assignee=...&exclude_case=...
// Checks BOTH internal cases AND Outlook calendar for collisions.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
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
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000);

  // Check ±2 hours window around the proposed time
  const windowStart = new Date(startDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(endDate.getTime() + 2 * 60 * 60 * 1000).toISOString();

  // Parse assignee names (comma-separated)
  const names = assignee.split(",").map((n) => n.trim()).filter(Boolean);

  // ── 1. Internal collision check (existing behavior) ───────────────────
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

  if (conflicts && conflicts.length > 0) {
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
          source: "internal",
          message: `${overlap.join(", ")} hat bereits einen Termin um ${time} (${c.category})`,
        });
      }
    }
  }

  // ── 2. Outlook free/busy check (if connected) ────────────────────────
  try {
    const auth = await getAccessToken(scope.tenantId);
    if (auth) {
      // Resolve staff names → emails
      const { data: staffRows } = await supabase
        .from("staff")
        .select("display_name, email")
        .eq("tenant_id", scope.tenantId)
        .eq("is_active", true)
        .in("display_name", names);

      const staffWithEmail = (staffRows ?? []).filter(
        (s): s is { display_name: string; email: string } => !!s.email,
      );

      if (staffWithEmail.length > 0) {
        const emails = staffWithEmail.map((s) => s.email);
        const results = await getFreeBusy(
          auth.token,
          emails,
          startDate.toISOString(),
          endDate.toISOString(),
        );

        // Check if any result has busy slots overlapping our window
        const emailToName = new Map(
          staffWithEmail.map((s) => [s.email.toLowerCase(), s.display_name]),
        );

        for (const r of results) {
          if (r.error) continue;
          for (const slot of r.busy) {
            const busyStart = new Date(slot.start).getTime();
            const busyEnd = new Date(slot.end).getTime();
            const propStart = startDate.getTime();
            const propEnd = endDate.getTime();

            // Overlap: proposed start < busy end AND proposed end > busy start
            if (propStart < busyEnd && propEnd > busyStart) {
              const name = emailToName.get(r.email.toLowerCase()) ?? r.email;
              const busyTime = new Date(slot.start).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Zurich",
              });
              const busyEndTime = new Date(slot.end).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Zurich",
              });
              return NextResponse.json({
                collision: true,
                source: "outlook",
                message: `${name} ist laut Outlook belegt: ${busyTime}–${busyEndTime}`,
              });
            }
          }
        }
      }
    }
  } catch (e) {
    // Outlook check is best-effort — don't block if it fails
    console.error("[check-collision] Outlook check failed:", e);
  }

  return NextResponse.json({ collision: false });
}
