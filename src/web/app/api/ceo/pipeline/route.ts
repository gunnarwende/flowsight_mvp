import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/** Pipeline stages in funnel order */
const STAGES = ["scouted", "contacted", "interested", "trial_active", "live_dock", "decision_pending", "converted", "offboarded"] as const;

/** Friendly labels for each stage */
const STAGE_LABELS: Record<string, string> = {
  scouted: "Scout",
  contacted: "Kontakt",
  interested: "Interessent",
  trial_active: "Trial aktiv",
  live_dock: "Trial (Dock)",
  decision_pending: "Entscheidung",
  converted: "Live",
  offboarded: "Archiv",
};

/** Funnel buckets for the visualization */
const FUNNEL_BUCKETS = [
  { key: "scout", label: "Scout", stages: ["scouted", "contacted"] },
  { key: "kontakt", label: "Kontakt", stages: ["interested"] },
  { key: "trial", label: "Trial", stages: ["trial_active", "live_dock", "decision_pending"] },
  { key: "live", label: "Live", stages: ["converted"] },
] as const;

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const d3ahead = new Date(now.getTime() + 3 * 86400_000).toISOString();
  const h48ahead = new Date(now.getTime() + 48 * 3600_000).toISOString();
  const d2ago = new Date(now.getTime() - 2 * 86400_000).toISOString();

  // Fetch all tenants with relevant fields
  const { data: tenants, error } = await supabase
    .from("tenants")
    .select("id, slug, name, trial_status, trial_start, trial_end, follow_up_at, prospect_email, prospect_phone, day5_nudge_at, day7_checked_at, day10_alerted_at, day13_emailed_at, day14_marked_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const all = tenants ?? [];

  // --- Funnel counts ---
  const stageCounts: Record<string, number> = {};
  for (const s of STAGES) stageCounts[s] = 0;
  for (const t of all) {
    const s = t.trial_status;
    if (s && s in stageCounts) stageCounts[s]++;
  }

  const funnel = FUNNEL_BUCKETS.map((b) => ({
    key: b.key,
    label: b.label,
    count: b.stages.reduce((sum, s) => sum + (stageCounts[s] ?? 0), 0),
  }));

  // --- Smart call list ---
  interface CallItem {
    slug: string;
    name: string;
    reason: string;
    phone: string | null;
    detail: string;
  }
  const calls: CallItem[] = [];

  for (const t of all) {
    if (t.trial_status !== "trial_active") continue;

    // Erstgespräch: trial started within last 2 days, no day5 nudge yet
    if (t.trial_start && t.trial_start >= d2ago && !t.day5_nudge_at) {
      const daysSinceStart = Math.floor((now.getTime() - new Date(t.trial_start).getTime()) / 86400_000);
      calls.push({
        slug: t.slug,
        name: t.name ?? t.slug,
        reason: "Erstgespräch",
        phone: t.prospect_phone,
        detail: `Tag ${daysSinceStart} im Trial`,
      });
    }

    // Follow-up: follow_up_at within next 3 days
    if (t.follow_up_at && t.follow_up_at <= d3ahead) {
      const followDate = new Date(t.follow_up_at);
      const diffDays = Math.ceil((followDate.getTime() - now.getTime()) / 86400_000);
      const label = diffDays <= 0 ? "heute" : diffDays === 1 ? "morgen" : `in ${diffDays}d`;
      calls.push({
        slug: t.slug,
        name: t.name ?? t.slug,
        reason: "Follow-up",
        phone: t.prospect_phone,
        detail: `Fällig ${label}`,
      });
    }

    // Ablaufend: trial_end within 48h
    if (t.trial_end && t.trial_end <= h48ahead) {
      const hoursLeft = Math.max(0, Math.floor((new Date(t.trial_end).getTime() - now.getTime()) / 3600_000));
      calls.push({
        slug: t.slug,
        name: t.name ?? t.slug,
        reason: "Ablaufend",
        phone: t.prospect_phone,
        detail: hoursLeft <= 24 ? `Noch ${hoursLeft}h` : `Noch ${Math.ceil(hoursLeft / 24)}d`,
      });
    }
  }

  // Deduplicate by slug (keep highest-priority reason: Ablaufend > Follow-up > Erstgespräch)
  const priorityOrder: Record<string, number> = { Ablaufend: 3, "Follow-up": 2, "Erstgespräch": 1 };
  const callMap = new Map<string, CallItem>();
  for (const c of calls) {
    const existing = callMap.get(c.slug);
    if (!existing || (priorityOrder[c.reason] ?? 0) > (priorityOrder[existing.reason] ?? 0)) {
      callMap.set(c.slug, c);
    }
  }
  const smartCalls = Array.from(callMap.values()).sort(
    (a, b) => (priorityOrder[b.reason] ?? 0) - (priorityOrder[a.reason] ?? 0)
  );

  // --- Conversion stats ---
  const converted = all.filter((t) => t.trial_status === "converted").length;
  const offboarded = all.filter((t) => t.trial_status === "offboarded").length;
  const totalDecided = converted + offboarded;
  const conversionRate = totalDecided > 0 ? Math.round((converted / totalDecided) * 100) : null;

  // --- Calendar: next 14 days of milestones ---
  interface CalendarItem {
    date: string; // YYYY-MM-DD
    slug: string;
    name: string;
    action: string;
    phone: string | null;
  }
  const calendar: CalendarItem[] = [];

  for (const t of all) {
    if (t.trial_status !== "trial_active" && t.trial_status !== "live_dock" && t.trial_status !== "decision_pending") continue;
    if (!t.trial_start) continue;

    const start = new Date(t.trial_start);
    const milestones: { day: number; action: string }[] = [
      { day: 2, action: "Erstgespräch" },
      { day: 5, action: "Day-5-Nudge" },
      { day: 7, action: "7-Tage-Check" },
      { day: 10, action: "Follow-up" },
      { day: 13, action: "Ablauf-Mail" },
      { day: 14, action: "Entscheidung" },
    ];

    for (const m of milestones) {
      const milestoneDate = new Date(start.getTime() + m.day * 86400_000);
      const diffMs = milestoneDate.getTime() - now.getTime();
      // Show if within next 14 days (or up to 1 day in the past for "today" context)
      if (diffMs >= -86400_000 && diffMs <= 14 * 86400_000) {
        calendar.push({
          date: milestoneDate.toISOString().slice(0, 10),
          slug: t.slug,
          name: t.name ?? t.slug,
          action: m.action,
          phone: t.prospect_phone,
        });
      }
    }

    // Trial expiration
    if (t.trial_end) {
      const endDate = new Date(t.trial_end);
      const diffMs = endDate.getTime() - now.getTime();
      if (diffMs >= -86400_000 && diffMs <= 14 * 86400_000) {
        calendar.push({
          date: endDate.toISOString().slice(0, 10),
          slug: t.slug,
          name: t.name ?? t.slug,
          action: "Trial-Ablauf",
          phone: t.prospect_phone,
        });
      }
    }
  }

  // Sort calendar by date
  calendar.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    funnel,
    stageCounts,
    stageLabels: STAGE_LABELS,
    smartCalls,
    conversion: { converted, offboarded, total: totalDecided, rate: conversionRate },
    calendar,
    snapshot_at: now.toISOString(),
  });
}
