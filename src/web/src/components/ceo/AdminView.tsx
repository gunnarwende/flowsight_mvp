"use client";

import { useEffect, useState, useCallback } from "react";

interface EnvVar {
  name: string;
  category: string;
  configured: boolean;
}

interface QuickLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Vercel",
    href: "https://vercel.com/gunnarwende/flowsight-mvp",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 19.5h20L12 2z" />
      </svg>
    ),
  },
  {
    label: "Supabase",
    href: "https://supabase.com/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    label: "Sentry",
    href: "https://sentry.io/organizations/flowsight/",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.047.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152-6.135c-.22-2.057-1.907-3.555-3.966-3.555H8.911c-2.059 0-3.746 1.498-3.966 3.555a23.91 23.91 0 0 1-1.152 6.136c2.56-.933 5.324-1.441 8.207-1.441Z" />
      </svg>
    ),
  },
  {
    label: "GitHub Actions",
    href: "https://github.com/gunnarwende/flowsight_mvp/actions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>
    ),
  },
  {
    label: "Retell",
    href: "https://beta.retellai.com/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
  },
];

const CATEGORY_ORDER = ["Database", "Email", "Voice", "SMS", "Monitoring", "Ops"];

export function AdminView() {
  const [vars, setVars] = useState<EnvVar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnv = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/admin/env-status");
      if (!res.ok) throw new Error("Env status fetch failed");
      const body = await res.json();
      setVars(body.vars ?? []);
      setError("");
    } catch {
      setError("Daten konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEnv();
  }, [fetchEnv]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy-300 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={fetchEnv} className="mt-3 text-sm text-red-600 underline hover:text-red-800">
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Group vars by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: vars.filter((v) => v.category === cat),
  })).filter((g) => g.items.length > 0);

  const configuredCount = vars.filter((v) => v.configured).length;
  const totalCount = vars.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-navy-900">Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Umgebungsvariablen, Quick Links und Verwaltung.
        </p>
      </div>

      {/* Env Status Dashboard */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-navy-800">Umgebungsvariablen</h2>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              configuredCount === totalCount
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {configuredCount}/{totalCount} konfiguriert
          </span>
        </div>

        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.category}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.items.map((v) => (
                  <div
                    key={v.name}
                    className={`rounded-xl px-3 py-2.5 border text-sm ${
                      v.configured
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          v.configured ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <span className="font-mono text-xs text-gray-700 truncate">{v.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-navy-900 text-white hover:bg-navy-800 rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-colors"
            >
              {link.icon}
              <span className="text-xs font-medium">{link.label}</span>
              <span className="text-[10px] text-white/50">Oeffnen</span>
            </a>
          ))}
        </div>
      </div>

      {/* Script Runner Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Aktionen</h2>
        <div className="flex items-center gap-3">
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 text-sm cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Morning Report manuell ausloesen
            <span className="text-[9px] bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded-md ml-1">Bald</span>
          </button>
        </div>
      </div>
    </div>
  );
}
