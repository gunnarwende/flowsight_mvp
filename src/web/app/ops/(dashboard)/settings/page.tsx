"use client";

import { useEffect, useState } from "react";
import { StaffManager } from "@/src/components/ops/StaffManager";

interface Settings {
  google_review_url: string;
  notify_reporter_email: boolean;
  notify_reporter_sms: boolean;
}

interface SettingsData {
  tenant_id: string;
  tenant_name: string;
  settings: Settings;
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);

  useEffect(() => {
    fetch("/api/ops/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: SettingsData | null) => {
        if (d) {
          setData(d);
          setGoogleReviewUrl(d.settings.google_review_url);
          setNotifyEmail(d.settings.notify_reporter_email);
          setNotifySms(d.settings.notify_reporter_sms);
        }
      })
      .catch(() => setError("Einstellungen konnten nicht geladen werden."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_review_url: googleReviewUrl,
          notify_reporter_email: notifyEmail,
          notify_reporter_sms: notifySms,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Speichern fehlgeschlagen.");
      }
    } catch {
      setError("Netzwerkfehler.");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-12 text-center">Laden…</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900">Einstellungen</h2>
        {data?.tenant_name && (
          <p className="text-sm text-gray-500">{data.tenant_name}</p>
        )}
      </div>

      <div className="space-y-5">
        {/* Team */}
        <Section
          title="Team"
          description="Mitarbeiter verwalten. Die E-Mail-Adresse wird für Kalendereinladungen bei Terminzuweisung verwendet."
        >
          <StaffManager tenantId={data?.tenant_id} embedded />
        </Section>

        {/* Benachrichtigungen */}
        <Section
          title="Benachrichtigungen"
          description="Automatische Rückmeldung an Meldende nach Fallerfassung."
        >
          <div className="space-y-3">
            <Toggle
              checked={notifyEmail}
              onChange={setNotifyEmail}
              label="E-Mail-Bestätigung"
              description="Meldende erhalten eine E-Mail mit Fallnummer und Zusammenfassung"
            />
            <Toggle
              checked={notifySms}
              onChange={setNotifySms}
              label="SMS-Bestätigung"
              description="Meldende erhalten eine SMS-Bestätigung nach der Meldung"
            />
          </div>
        </Section>

        {/* Google Review */}
        <Section
          title="Google-Bewertungen"
          description="Link zu Ihrem Google-Bewertungsprofil. Wird in Review-Anfragen verwendet."
        >
          <input
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Suchen Sie Ihren Betrieb auf Google Maps &rarr; &quot;Rezension
            schreiben&quot; &rarr; Link kopieren
          </p>
        </Section>
      </div>

      {/* Save bar */}
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Speichern…" : "Speichern"}
        </button>
        {saved && (
          <span className="text-sm text-emerald-600 font-medium">
            Gespeichert
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">{description}</p>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="pt-0.5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
            checked ? "bg-slate-700" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  );
}
