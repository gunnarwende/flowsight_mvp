"use client";

import { useEffect, useState, useCallback } from "react";

/* ── Types ──────────────────────────────────────────────────────────── */

interface Notification {
  id: string;
  timestamp: string;
  severity: "red" | "amber" | "blue" | "green";
  title: string;
  detail: string | null;
  tenant_name: string | null;
}

interface CommStats {
  emails_7d: number;
  emails_30d: number;
  sms_7d: number;
  sms_30d: number;
  reviews_7d: number;
  reviews_30d: number;
  voice_7d: number;
  voice_30d: number;
}

/* ── Severity colors ────────────────────────────────────────────────── */

const SEVERITY_BORDER: Record<string, string> = {
  red: "border-l-red-500",
  amber: "border-l-amber-500",
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
};

const SEVERITY_DOT: Record<string, string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
};

/* ── Main Component ─────────────────────────────────────────────────── */

export function NotificationsView() {
  const [activeTab, setActiveTab] = useState<"feed" | "comms">("feed");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [comms, setComms] = useState<CommStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [nRes, cRes] = await Promise.all([
        fetch("/api/ceo/notifications"),
        fetch("/api/ceo/comms"),
      ]);
      if (!nRes.ok || !cRes.ok) throw new Error("Fetch failed");
      const nData = await nRes.json();
      const cData = await cRes.json();
      setNotifications(nData.notifications ?? []);
      setComms(cData.stats ?? null);
      setFetchedAt(nData.fetched_at);
      setError("");
    } catch {
      setError("Daten konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

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
        <button onClick={fetchAll} className="mt-3 text-sm text-red-600 underline hover:text-red-800">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Benachrichtigungen</h1>
          {fetchedAt && (
            <p className="text-sm text-gray-500 mt-0.5">
              Letzte Aktualisierung: {new Date(fetchedAt).toLocaleTimeString("de-CH")}
            </p>
          )}
        </div>
        <button
          onClick={fetchAll}
          className="text-xs text-gray-500 hover:text-navy-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      {/* Tab selector */}
      <div className="bg-navy-100 rounded-lg p-0.5 inline-flex">
        <TabButton active={activeTab === "feed"} onClick={() => setActiveTab("feed")}>
          Feed
        </TabButton>
        <TabButton active={activeTab === "comms"} onClick={() => setActiveTab("comms")}>
          Kommunikation
        </TabButton>
      </div>

      {/* Content */}
      {activeTab === "feed" ? (
        <FeedTab notifications={notifications} />
      ) : (
        <CommsTab stats={comms} />
      )}
    </div>
  );
}

/* ── Tab Button ─────────────────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
        active
          ? "bg-white text-navy-900 shadow-sm"
          : "text-navy-600 hover:text-navy-800"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Feed Tab ───────────────────────────────────────────────────────── */

function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const now = new Date();
  const todayStr = now.toLocaleDateString("de-CH");
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("de-CH");

  const groups: Record<string, Notification[]> = {};
  for (const item of items) {
    const dateStr = new Date(item.timestamp).toLocaleDateString("de-CH");
    let label: string;
    if (dateStr === todayStr) label = "Heute";
    else if (dateStr === yesterdayStr) label = "Gestern";
    else label = dateStr;

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

function FeedTab({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">Keine neuen Benachrichtigungen</p>
        <p className="text-xs text-gray-400 mt-1">Ereignisse der letzten 48 Stunden erscheinen hier.</p>
      </div>
    );
  }

  const grouped = groupByDate(notifications);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border border-gray-200 shadow-sm border-l-4 ${
                  SEVERITY_BORDER[n.severity] ?? "border-l-gray-300"
                } p-4`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      SEVERITY_DOT[n.severity] ?? "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-navy-900 truncate">
                        {n.title}
                      </p>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {new Date(n.timestamp).toLocaleTimeString("de-CH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {n.detail && (
                      <p className="text-xs text-gray-500 mt-0.5">{n.detail}</p>
                    )}
                    {n.tenant_name && (
                      <span className="inline-block mt-1.5 text-[10px] text-navy-600 bg-navy-50 px-2 py-0.5 rounded-md font-medium">
                        {n.tenant_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Comms Tab ──────────────────────────────────────────────────────── */

function CommsTab({ stats }: { stats: CommStats | null }) {
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
        <p className="text-sm text-gray-500">Keine Kommunikationsdaten verfuegbar.</p>
      </div>
    );
  }

  const cards = [
    {
      label: "E-Mails",
      value7d: stats.emails_7d,
      value30d: stats.emails_30d,
      accent: "border-t-blue-500",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      ),
    },
    {
      label: "SMS",
      value7d: stats.sms_7d,
      value30d: stats.sms_30d,
      accent: "border-t-emerald-500",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
      ),
    },
    {
      label: "Bewertungen",
      value7d: stats.reviews_7d,
      value30d: stats.reviews_30d,
      accent: "border-t-gold-500",
      icon: (
        <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
    },
    {
      label: "Voice Calls",
      value7d: stats.voice_7d,
      value30d: stats.voice_30d,
      accent: "border-t-purple-500",
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border border-gray-200 shadow-sm border-t-4 ${card.accent} p-5`}
          >
            <div className="flex items-center gap-3 mb-4">
              {card.icon}
              <h3 className="text-sm font-semibold text-navy-800">{card.label}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-navy-900">{card.value7d}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Letzte 7 Tage</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{card.value30d}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Letzte 30 Tage</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Future placeholder */}
      <div className="bg-navy-50 rounded-xl border border-navy-200/50 p-4 text-center">
        <p className="text-xs text-navy-500">
          Detailansicht pro Betrieb folgt in einer zukuenftigen Phase.
        </p>
      </div>
    </div>
  );
}
