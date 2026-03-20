"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

// Heroicons outlines (stroke)
const PulseIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);
const BetriebeIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m4.5-18v18m4.5-18v18m4.5-18v18M6 6.75h.008v.008H6V6.75Zm0 3.75h.008v.008H6v-.008Zm0 3.75h.008v.008H6v-.008Zm4.5-7.5h.008v.008H10.5V6.75Zm0 3.75h.008v.008H10.5v-.008Zm0 3.75h.008v.008H10.5v-.008Zm4.5-7.5h.008v.008H15V6.75Zm0 3.75h.008v.008H15v-.008Zm0 3.75h.008v.008H15v-.008Z" />
  </svg>
);
const PipelineIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
);
const FinanzenIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
);
const MonitoringIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>
);
const AdminIcon = (
  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: "Pulse", href: "/ceo/pulse", icon: PulseIcon },
  { label: "Betriebe", href: "/ceo/betriebe", icon: BetriebeIcon },
  { label: "Pipeline", href: "/ceo/pipeline", icon: PipelineIcon },
  { label: "Finanzen", href: "/ceo/finanzen", icon: FinanzenIcon },
  { label: "Monitoring", href: "/ceo/monitoring", icon: MonitoringIcon, disabled: true },
  { label: "Admin", href: "/ceo/admin", icon: AdminIcon, disabled: true },
];

export function CeoShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();

  const userInitials = userEmail
    .split("@")[0]
    .split(".")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  function isActive(href: string) {
    if (href === "/ceo/pulse") return pathname === "/ceo/pulse" || pathname === "/ceo";
    return pathname.startsWith(href);
  }

  const brandHeader = (
    <div className="px-5 py-5 bg-gradient-to-br from-navy-900 to-navy-800">
      <Link href="/ceo/pulse" className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 shadow-sm">
          <div className="w-4 h-4 rounded-full bg-gold-500" />
        </div>
        <div className="min-w-0">
          <span className="block text-[15px] font-bold text-white leading-tight tracking-tight">FlowSight</span>
          <span className="block text-[11px] text-white/50 font-medium mt-0.5">CEO Dashboard</span>
        </div>
      </Link>
    </div>
  );

  const navLinks = (
    <nav className="flex-1 px-3 py-4">
      <div className="space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (item.disabled) {
            return (
              <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 cursor-default opacity-40">
                {item.icon}
                <span>{item.label}</span>
                <span className="ml-auto text-[9px] text-gray-500 bg-gray-800/60 px-1.5 py-0.5 rounded-md">Bald</span>
              </div>
            );
          }
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "text-white bg-white/10 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
              }`}
              style={active ? { borderLeft: "3px solid #c8965a", paddingLeft: "9px" } : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  const footer = (
    <div className="px-4 py-4 border-t border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold bg-gold-500/20 text-gold-500">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-gray-300 font-medium truncate leading-tight">
            {userEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <p className="text-[10px] text-gray-600 truncate leading-tight mt-0.5">{userEmail}</p>
        </div>
      </div>
      {/* Quick link to Leitsystem */}
      <Link
        href="/ops/cases"
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors mb-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        Zum Leitsystem
      </Link>
      {showLogout ? (
        <div className="bg-gray-900 rounded-lg p-3 space-y-2">
          <p className="text-[11px] text-amber-400/90">Nach Abmeldung ist ein neuer E-Mail-Code nötig.</p>
          <div className="flex gap-3">
            <form action="/api/ops/logout" method="POST">
              <button type="submit" className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors">Ja, abmelden</button>
            </form>
            <button onClick={() => setShowLogout(false)} className="text-[11px] text-gray-500 hover:text-gray-300 transition-colors">Abbrechen</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowLogout(true)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
          </svg>
          Abmelden
        </button>
      )}
    </div>
  );

  const sidebarContent = (
    <>
      {brandHeader}
      {navLinks}
      {footer}
    </>
  );

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-navy-950 border-r border-gray-800/50">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between bg-navy-900">
        <button onClick={() => setSidebarOpen(true)} aria-label="Menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <Link href="/ceo/pulse" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gold-500" />
          </div>
          <span className="font-semibold text-white text-sm">FlowSight CEO</span>
        </Link>
        <div className="w-9" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 max-w-[80%] h-full bg-navy-950 flex flex-col shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} aria-label="Close" className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10">
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
        <div className="max-w-6xl mx-auto px-4 py-4 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
