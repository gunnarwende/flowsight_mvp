"use client";

import { useEffect, useState } from "react";

interface Settings {
  google_review_url: string;
  default_appointment_duration_min: number;
  notify_reporter_email: boolean;
  notify_reporter_sms: boolean;
  business_calendar_email: string;
}

interface SettingsData {
  tenant_name: string;
  case_id_prefix: string;
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
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [calendarEmail, setCalendarEmail] = useState("");

  useEffect(() => {
    fetch("/api/ops/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((d: SettingsData | null) => {
        if (d) {
          setData(d);
          setGoogleReviewUrl(d.settings.google_review_url);
          setAppointmentDuration(d.settings.default_appointment_duration_min);
          setNotifyEmail(d.settings.notify_reporter_email);
          setNotifySms(d.settings.notify_reporter_sms);
          setCalendarEmail(d.settings.business_calendar_email);
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
          default_appointment_duration_min: appointmentDuration,
          notify_reporter_email: notifyEmail,
          notify_reporter_sms: notifySms,
          business_calendar_email: calendarEmail,
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

      {/* Betriebsinformationen — prominent, read-only */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Betrieb
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Betriebsname</p>
            <p className="text-gray-900 font-medium">
              {data?.tenant_name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Fall-Präfix</p>
            <p className="text-gray-900 font-medium">
              {data?.case_id_prefix ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Editable settings */}
      <div className="space-y-5">
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

        {/* Termine */}
        <Section
          title="Termine"
          description="Standard-Einstellungen für neue Termine."
        >
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Standard-Termindauer
          </label>
          <select
            value={appointmentDuration}
            onChange={(e) => setAppointmentDuration(Number(e.target.value))}
            className="w-full sm:w-48 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value={30}>30 Minuten</option>
            <option value={45}>45 Minuten</option>
            <option value={60}>60 Minuten (Standard)</option>
            <option value={90}>90 Minuten</option>
            <option value={120}>2 Stunden</option>
            <option value={180}>3 Stunden</option>
            <option value={240}>4 Stunden</option>
          </select>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kalender-E-Mail
            </label>
            <input
              type="email"
              value={calendarEmail}
              onChange={(e) => setCalendarEmail(e.target.value)}
              placeholder="betrieb@example.ch"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Termine werden als ICS-Einladung an diese Adresse gesendet
            </p>
          </div>
        </Section>

        {/* Bestätigungen */}
        <Section
          title="Bestätigungen an Meldende"
          description="Automatische Rückmeldung nach Fallerfassung."
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
