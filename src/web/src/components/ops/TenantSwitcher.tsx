"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface TenantSwitcherProps {
  activeTenantId: string | null;
  homeTenantId: string | null;
}

export function TenantSwitcher({ activeTenantId, homeTenantId }: TenantSwitcherProps) {
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

  async function switchTo(tenantId: string | null) {
    setSwitching(true);
    setOpen(false);
    await fetch("/api/ops/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
    router.refresh();
    // Small delay to let server re-render with new cookie
    setTimeout(() => setSwitching(false), 500);
  }

  if (tenants.length < 2) return null; // No point showing switcher with 1 tenant

  const active = tenants.find((t) => t.id === activeTenantId);
  const isHome = !activeTenantId || activeTenantId === homeTenantId;

  // Recent tenants (from cookie, parsed client-side for ordering)
  // For now, just show all tenants sorted: active first, then alphabetical
  const sorted = [...tenants].sort((a, b) => {
    if (a.id === activeTenantId) return -1;
    if (b.id === activeTenantId) return 1;
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
          {switching ? "Wechsle…" : active?.name ?? "Betrieb wählen"}
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
          {/* Home tenant option */}
          {!isHome && (
            <button
              onClick={() => switchTo(null)}
              className="w-full flex items-center gap-2.5 px-3 py-3 hover:bg-white/[0.06] transition-colors border-b border-gray-800 min-h-[44px]"
            >
              <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[12px] text-amber-400 font-medium">Mein Betrieb</span>
            </button>
          )}

          {/* Tenant list */}
          {sorted.map((t) => {
            const isCurrent = t.id === activeTenantId;
            return (
              <button
                key={t.id}
                onClick={() => !isCurrent && switchTo(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 transition-colors min-h-[44px] ${
                  isCurrent ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className={`text-[12px] truncate flex-1 ${isCurrent ? "text-white font-semibold" : "text-gray-400"}`}>
                  {t.name}
                </span>
                {isCurrent && (
                  <svg className="w-3.5 h-3.5 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
