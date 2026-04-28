"use client";

import { useState } from "react";

/**
 * FB27 — Admin escape hatch for pub tenants.
 *
 * On pub tenants we deliberately hide the full TenantSwitcher dropdown so a
 * founder testing the app on a customer's device can never accidentally leak
 * other customer names. This single-action button is the replacement: it
 * resets the active tenant to the admin's own home tenant and lands them on
 * /ops/cases. No dropdown, no list, no leak.
 *
 * Visible only when:
 *   - user is admin
 *   - user is currently impersonating a pub tenant (see OpsShell.tsx)
 */
export function AdminBackToWorkspace({ homeTenantId }: { homeTenantId: string | null }) {
  const [busy, setBusy] = useState(false);

  async function back() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/ops/switch-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: homeTenantId, viewAsRole: null }),
      });
    } catch { /* still navigate */ }
    // Hard-redirect to ensure cookie + session reload
    window.location.href = "/ops/cases";
  }

  return (
    <div data-owner-only="admin-back" className="px-5 pb-3 -mt-1">
      <button
        type="button"
        onClick={back}
        disabled={busy}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-left min-h-[36px] border border-dashed border-white/10"
        title="Switch back to your admin workspace"
      >
        <svg className="w-3.5 h-3.5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="text-[11px] text-white/50 font-medium truncate">
          {busy ? "Switching…" : "Admin: back to workspace"}
        </span>
      </button>
    </div>
  );
}
