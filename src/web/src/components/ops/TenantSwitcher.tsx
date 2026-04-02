"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  color: string;
  trial_status: string | null;
  is_demo: boolean;
}

interface TenantSwitcherProps {
  activeTenantId: string | null;
  homeTenantId: string | null;
  viewAsRole?: "techniker" | null;
}

// Status priority for sorting (lower = higher priority)
const STATUS_PRIORITY: Record<string, number> = {
  trial_active: 0,
  interested: 1,
  live_dock: 2,
  decision_pending: 3,
  converted: 4,
  contacted: 5,
  scouted: 6,
  parked: 7,
  offboarded: 8,
};

// Status colors for indicator dots
const STATUS_COLORS: Record<string, string> = {
  trial_active: "#22c55e",   // green
  interested: "#f59e0b",     // amber
  converted: "#3b82f6",      // blue
  live_dock: "#8b5cf6",      // violet
  decision_pending: "#ef4444", // red
  offboarded: "#6b7280",     // gray
};

export function TenantSwitcher({ activeTenantId, homeTenantId, viewAsRole }: TenantSwitcherProps) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ops/tenants")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Tenant[]) => setTenants(data))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function switchTo(tenantId: string | null, role?: "techniker" | null) {
    setSwitching(true);
    setOpen(false);
    await fetch("/api/ops/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, viewAsRole: role ?? null }),
    });
    router.refresh();
    setTimeout(() => setSwitching(false), 500);
  }

  async function toggleRole() {
    const newRole = viewAsRole === "techniker" ? null : "techniker";
    setSwitching(true);
    setOpen(false);
    await fetch("/api/ops/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId: activeTenantId, viewAsRole: newRole }),
    });
    router.refresh();
    setTimeout(() => setSwitching(false), 500);
  }

  if (tenants.length < 2) return null;

  const active = tenants.find((t) => t.id === activeTenantId);

  // Sort: active first, then by status priority, then alphabetical. Demo last.
  const sorted = [...tenants].sort((a, b) => {
    if (a.id === activeTenantId) return -1;
    if (b.id === activeTenantId) return 1;
    // Demo tenants go to bottom
    if (a.is_demo && !b.is_demo) return 1;
    if (!a.is_demo && b.is_demo) return -1;
    // Then by status priority
    const aPrio = STATUS_PRIORITY[a.trial_status ?? ""] ?? 99;
    const bPrio = STATUS_PRIORITY[b.trial_status ?? ""] ?? 99;
    if (aPrio !== bPrio) return aPrio - bPrio;
    return a.name.localeCompare(b.name, "de");
  });

  return (
    <div ref={ref} className="relative px-5 pb-3 -mt-1">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={switching}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-left min-h-[44px]"
      >
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: active?.color ?? "#64748b" }}
        />
        <span className="text-[12px] text-white/70 truncate flex-1">
          {switching ? "Wechsle\u2026" : active?.name ?? "Betrieb w\u00e4hlen"}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-h-[320px] overflow-y-auto">
          {/* Tenant list — sorted by status priority */}
          {sorted.map((t) => {
            const isCurrent = t.id === activeTenantId;
            const statusColor = STATUS_COLORS[t.trial_status ?? ""] ?? "#64748b";
            return (
              <button
                key={t.id}
                onClick={() => !isCurrent && switchTo(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 transition-colors min-h-[44px] ${
                  isCurrent ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
                }`}
              >
                {/* Status dot */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColor }}
                  title={t.trial_status ?? "unbekannt"}
                />
                {/* Tenant name */}
                <span className={`text-[12px] truncate flex-1 ${isCurrent ? "text-white font-semibold" : "text-gray-400"}`}>
                  {t.name}
                  {t.is_demo && (
                    <span className="ml-1.5 text-[10px] text-gray-600 font-normal">(Demo)</span>
                  )}
                </span>
                {/* Check mark for active */}
                {isCurrent && (
                  <svg className="w-3.5 h-3.5 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Role toggle — test as techniker */}
          <button
            onClick={toggleRole}
            className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-white/[0.06] transition-colors border-t border-gray-800 min-h-[44px]"
          >
            <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span className="text-[12px] text-violet-400 font-medium">
              {viewAsRole === "techniker" ? "Zur\u00fcck zu Admin" : "Als Techniker ansehen"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
