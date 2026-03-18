"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "Wie weise ich einen Fall einem Mitarbeiter zu?",
    a: "Öffnen Sie den Fall, klicken Sie auf Bearbeiten im Übersicht-Bereich. Unter \"Zuständig\" können Sie einen oder mehrere Mitarbeiter auswählen. Der Mitarbeiter wird automatisch per E-Mail benachrichtigt.",
  },
  {
    q: "Wie versende ich einen Termin an den Kunden?",
    a: "Im Fall unter Bearbeiten wählen Sie einen Termin aus. Nach der Auswahl erscheint der Button \"Termin versenden\". Der Kunde erhält eine E-Mail und/oder SMS — je nach Ihren Einstellungen.",
  },
  {
    q: "Wie funktioniert die Bewertungsanfrage?",
    a: "Wenn ein Fall als \"Erledigt\" markiert ist, erscheint die Option \"Bewertung anfragen\". Der Kunde erhält dann einen Link zu einer Bewertungsseite. Sie können pro Fall maximal 2 Anfragen senden.",
  },
  {
    q: "Kann ich meine Benachrichtigungen anpassen?",
    a: "Ja — unter Einstellungen > Benachrichtigungen können Sie für jeden Kanal (E-Mail, SMS) einzeln aktivieren oder deaktivieren, welche Benachrichtigungen versendet werden.",
  },
  {
    q: "Wie erreiche ich den Support?",
    a: "Nutzen Sie das Kontaktformular unten auf dieser Seite. Alternativ erreichen Sie uns telefonisch unter 044 552 09 19 oder per E-Mail an support@flowsight.ch.",
  },
];

const SUBJECTS = [
  "Frage zum System",
  "Problem melden",
  "Verbesserungsvorschlag",
  "Sonstiges",
];

export default function HilfePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/ops/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message: message.trim() }),
      });
      if (!res.ok) throw new Error("Senden fehlgeschlagen");
      setSent(true);
      setMessage("");
    } catch {
      setError("Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    }
    setSending(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Hilfe</h1>
      <p className="text-sm text-gray-500 mb-6">Häufige Fragen und Kontakt zum Support.</p>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 divide-y divide-gray-100">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Häufige Fragen</h2>
        </div>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <span className="text-sm text-gray-700 font-medium pr-4">{item.q}</span>
              <svg
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">Kontakt</h2>
        <p className="text-xs text-gray-500 mb-4">Schreiben Sie uns — wir melden uns so schnell wie möglich.</p>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <svg className="w-8 h-8 text-emerald-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <p className="text-sm font-medium text-emerald-800">Ihre Nachricht wurde erfasst.</p>
            <p className="text-xs text-emerald-600 mt-1">Wir kümmern uns darum.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 text-xs text-emerald-700 hover:text-emerald-900 underline"
            >
              Weitere Nachricht senden
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Betreff</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30"
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nachricht</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreiben Sie Ihr Anliegen…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors min-h-[44px]"
              >
                {sending ? "Wird gesendet…" : "Absenden"}
              </button>
              {error && <span className="text-xs text-red-600">{error}</span>}
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            <a href="tel:+41445520919" className="hover:text-gray-700">044 552 09 19</a>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            <a href="mailto:support@flowsight.ch" className="hover:text-gray-700">support@flowsight.ch</a>
          </div>
        </div>
      </div>
    </div>
  );
}
