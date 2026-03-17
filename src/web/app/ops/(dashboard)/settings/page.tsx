"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StaffManager } from "@/src/components/ops/StaffManager";

interface Settings {
  google_review_url: string;
  notify_reporter_email: boolean;
  notify_reporter_sms: boolean;
  notify_termin_email: boolean;
  notify_termin_sms: boolean;
  notify_termin_reminder_sms: boolean;
  notify_staff_assignment: boolean;
}

interface SettingsData {
  tenant_id: string;
  tenant_name: string;
  settings: Settings;
}

export default function SettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state — Benachrichtigungen
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyTerminEmail, setNotifyTerminEmail] = useState(true);
  const [notifyTerminSms, setNotifyTerminSms] = useState(true);
  const [notifyTerminReminderSms, setNotifyTerminReminderSms] = useState(true);
  const [notifyStaffAssignment, setNotifyStaffAssignment] = useState(true);
  const [notifyBaseline, setNotifyBaseline] = useState({
    email: true, sms: true,
    terminEmail: true, terminSms: true, terminReminderSms: true, staffAssignment: true,
  });
  const [notifySaving, setNotifySaving] = useState(false);
  const [notifySaved, setNotifySaved] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  // Form state — Google Review
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [reviewBaseline, setReviewBaseline] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ops/settings")
      .then((res) => {
        if (res.status === 403) { router.replace("/ops/cases"); return null; }
        return res.ok ? res.json() : null;
      })
      .then((d: SettingsData | null) => {
        if (d) {
          setData(d);
          setGoogleReviewUrl(d.settings.google_review_url);
          setReviewBaseline(d.settings.google_review_url);
          setNotifyEmail(d.settings.notify_reporter_email);
          setNotifySms(d.settings.notify_reporter_sms);
          setNotifyTerminEmail(d.settings.notify_termin_email);
          setNotifyTerminSms(d.settings.notify_termin_sms);
          setNotifyTerminReminderSms(d.settings.notify_termin_reminder_sms);
          setNotifyStaffAssignment(d.settings.notify_staff_assignment);
          setNotifyBaseline({
            email: d.settings.notify_reporter_email,
            sms: d.settings.notify_reporter_sms,
            terminEmail: d.settings.notify_termin_email,
            terminSms: d.settings.notify_termin_sms,
            terminReminderSms: d.settings.notify_termin_reminder_sms,
            staffAssignment: d.settings.notify_staff_assignment,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const notifyDirty =
    notifyEmail !== notifyBaseline.email || notifySms !== notifyBaseline.sms ||
    notifyTerminEmail !== notifyBaseline.terminEmail || notifyTerminSms !== notifyBaseline.terminSms ||
    notifyTerminReminderSms !== notifyBaseline.terminReminderSms || notifyStaffAssignment !== notifyBaseline.staffAssignment;
  const reviewDirty = googleReviewUrl !== reviewBaseline;

  async function saveNotify() {
    setNotifySaving(true);
    setNotifySaved(false);
    setNotifyError(null);
    try {
      const res = await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notify_reporter_email: notifyEmail,
          notify_reporter_sms: notifySms,
          notify_termin_email: notifyTerminEmail,
          notify_termin_sms: notifyTerminSms,
          notify_termin_reminder_sms: notifyTerminReminderSms,
          notify_staff_assignment: notifyStaffAssignment,
        }),
      });
      if (res.ok) {
        setNotifyBaseline({
          email: notifyEmail, sms: notifySms,
          terminEmail: notifyTerminEmail, terminSms: notifyTerminSms,
          terminReminderSms: notifyTerminReminderSms, staffAssignment: notifyStaffAssignment,
        });
        setNotifySaved(true);
        setTimeout(() => setNotifySaved(false), 3000);
      } else {
        setNotifyError("Speichern fehlgeschlagen.");
      }
    } catch {
      setNotifyError("Netzwerkfehler.");
    }
    setNotifySaving(false);
  }

  async function saveReview() {
    setReviewSaving(true);
    setReviewSaved(false);
    setReviewError(null);
    try {
      const res = await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_review_url: googleReviewUrl }),
      });
      if (res.ok) {
        setReviewBaseline(googleReviewUrl);
        setReviewSaved(true);
        setTimeout(() => setReviewSaved(false), 3000);
      } else {
        setReviewError("Speichern fehlgeschlagen.");
      }
    } catch {
      setReviewError("Netzwerkfehler.");
    }
    setReviewSaving(false);
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
        {/* Team — StaffManager handles its own save */}
        <Section
          title="Team"
          description="Mitarbeiter verwalten. Die E-Mail-Adresse wird für Kalendereinladungen bei Terminvergabe verwendet."
        >
          <StaffManager tenantId={data?.tenant_id} embedded />
        </Section>

        {/* Benachrichtigungen — per-card save */}
        <Section
          title="Benachrichtigungen"
          description="Automatische Benachrichtigungen an Kunden und Mitarbeiter."
        >
          <div className="space-y-5">
            {/* Sub-section: Bei Fallerfassung */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bei Fallerfassung</p>
              <div className="space-y-3">
                <Toggle
                  checked={notifyEmail}
                  onChange={setNotifyEmail}
                  label="E-Mail-Bestätigung an Kunden"
                  description="Kunden erhalten eine E-Mail mit Fallnummer und Zusammenfassung"
                />
                <Toggle
                  checked={notifySms}
                  onChange={setNotifySms}
                  label="SMS-Bestätigung an Kunden"
                  description="Kunden erhalten eine SMS-Bestätigung nach der Meldung"
                />
              </div>
            </div>

            {/* Sub-section: Bei Terminvergabe */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bei Terminvergabe</p>
              <div className="space-y-3">
                <Toggle
                  checked={notifyTerminEmail}
                  onChange={setNotifyTerminEmail}
                  label="E-Mail-Terminbestätigung an Kunden"
                  description="Kunden erhalten eine E-Mail wenn ein Termin eingeplant wird"
                />
                <Toggle
                  checked={notifyTerminSms}
                  onChange={setNotifyTerminSms}
                  label="SMS-Terminbestätigung an Kunden"
                  description="Kunden erhalten eine SMS mit den Termindetails"
                />
                <Toggle
                  checked={notifyStaffAssignment}
                  onChange={setNotifyStaffAssignment}
                  label="E-Mail an Mitarbeiter bei Vergabe"
                  description="Mitarbeiter erhalten eine E-Mail wenn ihnen ein Fall zugewiesen wird"
                />
              </div>
            </div>

            {/* Sub-section: Erinnerungen */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Erinnerungen</p>
              <div className="space-y-3">
                <Toggle
                  checked={notifyTerminReminderSms}
                  onChange={setNotifyTerminReminderSms}
                  label="24h-Erinnerung an Kunden per SMS"
                  description="Kunden erhalten am Vortag eine SMS-Erinnerung an den Termin"
                />
              </div>
            </div>
          </div>
          {notifyDirty && (
            <CardSaveBar
              saving={notifySaving}
              saved={notifySaved}
              error={notifyError}
              onSave={saveNotify}
              onCancel={() => {
                setNotifyEmail(notifyBaseline.email);
                setNotifySms(notifyBaseline.sms);
                setNotifyTerminEmail(notifyBaseline.terminEmail);
                setNotifyTerminSms(notifyBaseline.terminSms);
                setNotifyTerminReminderSms(notifyBaseline.terminReminderSms);
                setNotifyStaffAssignment(notifyBaseline.staffAssignment);
              }}
            />
          )}
        </Section>

        {/* Google Review — per-card save */}
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
          {reviewDirty && (
            <CardSaveBar
              saving={reviewSaving}
              saved={reviewSaved}
              error={reviewError}
              onSave={saveReview}
              onCancel={() => setGoogleReviewUrl(reviewBaseline)}
            />
          )}
        </Section>
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

function CardSaveBar({
  saving,
  saved,
  error,
  onSave,
  onCancel,
}: {
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {saving ? "Speichern…" : "Speichern"}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
        >
          Abbrechen
        </button>
      )}
      {saved && (
        <span className="text-xs text-emerald-600 font-medium">Gespeichert</span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
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
