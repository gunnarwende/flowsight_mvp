"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallPrompt } from "./InstallPrompt";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import { UpdatePrompt } from "./UpdatePrompt";

// ---------------------------------------------------------------------------
// Navigation — 3 items only, mirroring the Leitsystem architecture
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Leitzentrale",
    href: "/ops/cases",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Einstellungen",
    href: "/ops/settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OpsShell({
  userEmail,
  tenantName,
  brandColor,
  staffRole,
  children,
}: {
  userEmail: string;
  tenantName?: string;
  /** Tenant brand color hex (e.g. "#004994"). Falls back to neutral slate if not set. */
  brandColor?: string;
  /** Staff role for RBAC — techniker sees limited nav */
  staffRole?: "admin" | "techniker";
  children: React.ReactNode;
}) {
  // Identity Contract R4: No "FlowSight" visible to end users
  const displayName = tenantName ?? "Leitsystem";
  const initials = tenantName
    ? tenantName
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "LS";
  const color = brandColor ?? "#64748b";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const pathname = usePathname();

  // RBAC: hide Einstellungen for techniker
  const visibleNavItems = staffRole === "techniker"
    ? NAV_ITEMS.filter(item => item.href !== "/ops/settings")
    : NAV_ITEMS;

  function isNavActive(href: string): boolean {
    if (href === "/ops/cases") {
      // Leitzentrale: exact match + case detail pages /ops/cases/[id]
      return pathname === "/ops/cases" || pathname === "/ops/cases/" || pathname.startsWith("/ops/cases/");
    }
    return pathname.startsWith(href);
  }

  // ── Brand Header ────────────────────────────────────────────────────
  const brandHeader = (
    <div
      className="px-5 py-6"
      style={{
        backgroundColor: color,
        backgroundImage: `linear-gradient(to bottom, ${color}, ${color}ee)`,
      }}
    >
      <Link href="/ops/cases" className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        >
          <span className="text-white font-bold text-lg tracking-tight">{initials}</span>
        </div>
        <div className="min-w-0">
          <span className="block text-[14px] font-semibold text-white leading-tight">
            {displayName}
          </span>
          <span className="block text-[11px] text-white/50 mt-0.5">Leitsystem</span>
        </div>
      </Link>
    </div>
  );

  // ── Nav Links ───────────────────────────────────────────────────────
  const navLinks = (
    <nav className="flex-1 px-3 py-5">
      <div className="space-y-1">
        {visibleNavItems.map((item) => {
          const active = isNavActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "text-white bg-white/[0.08]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
              }`}
              style={
                active
                  ? { borderLeft: `3px solid ${color}`, paddingLeft: "9px" }
                  : undefined
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  // ── Footer ──────────────────────────────────────────────────────────
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // User initials for avatar
  const userInitials = userEmail
    .split("@")[0]
    .split(".")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const footer = (
    <div className="px-4 py-4 border-t border-gray-800">
      {/* User info row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
          style={{ backgroundColor: `${color}33`, color }}
        >
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-gray-300 font-medium truncate leading-tight">
            {userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <p className="text-[10px] text-gray-600 truncate leading-tight mt-0.5">
            {userEmail}
          </p>
        </div>
      </div>

      {/* Logout */}
      {showLogoutConfirm ? (
        <div className="bg-gray-900 rounded-lg p-3 space-y-2">
          <p className="text-[11px] text-amber-400/90">
            Nach Abmeldung ist ein neuer E-Mail-Code nötig.
          </p>
          <div className="flex gap-3">
            <form action="/api/ops/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                </svg>
                Ja, abmelden
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
          </svg>
          Abmelden
        </button>
      )}
    </div>
  );

  // ── Sidebar Content ─────────────────────────────────────────────────
  const sidebarContent = (
    <>
      {brandHeader}
      {navLinks}
      {footer}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-gray-950 border-r border-gray-800/50">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div
        className="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Menü öffnen"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <Link href="/ops/cases" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/20"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <span className="font-semibold text-white text-sm truncate max-w-[160px]">{displayName}</span>
        </Link>
        <div className="w-9" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[80%] h-full bg-gray-950 flex flex-col shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Menü schliessen"
              className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}


      {/* Main content */}
      <main className="md:ml-64 overflow-x-hidden">
        <InstallPrompt />
        {/* Dev: Mobile Preview Toggle (top-right, desktop only) */}
        <div className="hidden md:flex justify-end px-4 pt-2">
          <button
            onClick={() => setMobilePreview(p => !p)}
            className={`p-1.5 rounded-md text-xs transition-colors ${mobilePreview ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}`}
            title={mobilePreview ? "Desktop-Ansicht" : "Mobile-Vorschau"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </button>
        </div>
        <div className={`mx-auto px-4 py-6 min-w-0 transition-all duration-300 ${mobilePreview ? "max-w-[390px] border-x border-gray-300 bg-white min-h-screen shadow-lg" : "max-w-6xl"}`}>
          {children}
        </div>
      </main>
      <ServiceWorkerRegistration />
      <UpdatePrompt />
    </div>
  );
}
