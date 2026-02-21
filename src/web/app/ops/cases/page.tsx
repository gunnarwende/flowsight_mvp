import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CaseRow {
  id: string;
  created_at: string;
  status: string;
  urgency: string;
  category: string;
  city: string;
  plz: string;
  source: string;
  assignee_text: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  scheduled: "Geplant",
  done: "Erledigt",
};

const URGENCY_COLORS: Record<string, string> = {
  notfall: "bg-red-900/40 text-red-300 border-red-700",
  dringend: "bg-amber-900/40 text-amber-300 border-amber-700",
  normal: "bg-blue-900/40 text-blue-300 border-blue-700",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-slate-700 text-slate-200",
  contacted: "bg-sky-900/50 text-sky-300",
  scheduled: "bg-violet-900/50 text-violet-300",
  done: "bg-emerald-900/50 text-emerald-300",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function OpsCasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  // Auth check (middleware gates, but double-check server-side)
  const authClient = await getAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect("/ops/login");

  const params = await searchParams;

  // Filters from URL
  const filterStatus = params.status;
  const filterUrgency = params.urgency;
  const filterCategory = params.category;
  const filterSource = params.source;
  const filterAssigned = params.assigned;
  const showAll = params.show === "all";

  const supabase = getServiceClient();

  // Stats query (lightweight, all cases, for dashboard tiles)
  const statsQuery = supabase
    .from("cases")
    .select("id, status, created_at, updated_at")
    .limit(1000);

  // Filtered list query
  let listQuery = supabase
    .from("cases")
    .select(
      "id, created_at, status, urgency, category, city, plz, source, assignee_text"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  // Default: open cases (status != done), unless showAll or explicit status filter
  if (filterStatus) {
    listQuery = listQuery.eq("status", filterStatus);
  } else if (!showAll) {
    listQuery = listQuery.neq("status", "done");
  }

  if (filterUrgency) listQuery = listQuery.eq("urgency", filterUrgency);
  if (filterCategory) listQuery = listQuery.ilike("category", filterCategory);
  if (filterSource) listQuery = listQuery.eq("source", filterSource);
  if (filterAssigned === "yes") listQuery = listQuery.not("assignee_text", "is", null);

  const [{ data: allCases }, { data: cases, error }] = await Promise.all([
    statsQuery,
    listQuery,
  ]);

  // Dashboard counts
  const todayZurich = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(new Date());
  const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

  const openCount = allCases?.filter((c) => c.status !== "done").length ?? 0;
  const todayCount =
    allCases?.filter((c) => {
      const cDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Zurich",
      }).format(new Date(c.created_at));
      return cDate === todayZurich;
    }).length ?? 0;
  const doneWeekCount =
    allCases?.filter(
      (c) => c.status === "done" && new Date(c.updated_at) >= sevenDaysAgo
    ).length ?? 0;

  if (error) {
    return (
      <OpsShell user={user.email ?? ""}>
        <p className="text-red-400">Fehler beim Laden: {error.message}</p>
      </OpsShell>
    );
  }

  const rows = (cases ?? []) as CaseRow[];

  return (
    <OpsShell user={user.email ?? ""}>
      {/* Dashboard tiles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <DashTile label="Offen" value={openCount} accent="text-blue-400" />
        <DashTile label="Heute erstellt" value={todayCount} accent="text-slate-300" />
        <DashTile label="Erledigt (7 Tage)" value={doneWeekCount} accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FilterChip
          label="Offen"
          active={!filterStatus && !showAll}
          href="/ops/cases"
        />
        <FilterChip
          label="Alle"
          active={showAll && !filterStatus}
          href="/ops/cases?show=all"
        />
        <span className="border-l border-slate-700 mx-1 h-5 inline-block" />
        {(["new", "contacted", "scheduled", "done"] as const).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            active={filterStatus === s}
            href={`/ops/cases?status=${s}`}
          />
        ))}
        <span className="border-l border-slate-700 mx-1 h-5 inline-block" />
        {(["notfall", "dringend", "normal"] as const).map((u) => (
          <FilterChip
            key={u}
            label={u.charAt(0).toUpperCase() + u.slice(1)}
            active={filterUrgency === u}
            href={`/ops/cases?urgency=${u}`}
          />
        ))}
        <span className="border-l border-slate-700 mx-1 h-5 inline-block" />
        {(["wizard", "voice"] as const).map((src) => (
          <FilterChip
            key={src}
            label={src === "wizard" ? "Wizard" : "Voice"}
            active={filterSource === src}
            href={`/ops/cases?source=${src}`}
          />
        ))}
        <FilterChip
          label="Zugewiesen"
          active={filterAssigned === "yes"}
          href="/ops/cases?assigned=yes"
        />
      </div>

      {/* Count */}
      <p className="text-slate-500 text-xs mb-3">
        {rows.length} Case{rows.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      {rows.length === 0 ? (
        <p className="text-slate-500 text-sm py-8 text-center">
          Keine Cases gefunden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-700">
                <th className="pb-2.5 pr-4 font-medium">Datum</th>
                <th className="pb-2.5 pr-4 font-medium">Status</th>
                <th className="pb-2.5 pr-4 font-medium">Dringlichkeit</th>
                <th className="pb-2.5 pr-4 font-medium">Kategorie</th>
                <th className="pb-2.5 pr-4 font-medium">Ort</th>
                <th className="pb-2.5 pr-4 font-medium">Quelle</th>
                <th className="pb-2.5 font-medium">Zuständig</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/40 group"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/ops/cases/${c.id}`}
                      className="text-blue-400 group-hover:text-blue-300 hover:underline font-medium"
                    >
                      {formatDate(c.created_at)}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-700 text-slate-300"}`}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium border ${URGENCY_COLORS[c.urgency] ?? ""}`}
                    >
                      {c.urgency}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{c.category}</td>
                  <td className="py-3 pr-4 text-slate-400">
                    {c.plz} {c.city}
                  </td>
                  <td className="py-3 pr-4 text-slate-500 capitalize">{c.source}</td>
                  <td className="py-3 text-slate-400">
                    {c.assignee_text ?? <span className="text-slate-600">&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OpsShell>
  );
}

// ---------------------------------------------------------------------------
// Layout shell
// ---------------------------------------------------------------------------

function OpsShell({
  user,
  children,
}: {
  user: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ops/cases" className="font-bold text-lg">
            FlowSight Ops
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user}</span>
          <form action="/api/ops/logout" method="POST">
            <button
              type="submit"
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard tile
// ---------------------------------------------------------------------------

function DashTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3">
      <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter chip
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
      }`}
    >
      {label}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}
