import type { Metadata } from "next";
import { getCockpitSessionByToken } from "@/src/lib/cockpit/cockpitSessions";
import type { CockpitDraft, CockpitSession, DispositionKey } from "@/src/lib/cockpit/types";
import { DISPOSITION_DEFAULTS } from "@/src/lib/cockpit/types";
import { PrintButton } from "./PrintButton";

/**
 * /aufbau/[token]/zusammenfassung — M3 „Ihr FlowSight-Setup" als druckbares Dokument.
 *
 * Read-only Beleg + Nachschlagewerk (Founder-Wunsch): der Betrieb sieht schwarz auf
 * weiss, was er eingestellt hat, und sichert es per Browser-Druck als PDF (keine
 * schwere PDF-Lib nötig). Helles, professionelles Layout (druckfreundlich).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Ihr FlowSight-Setup",
};

const GOLD = "#b8902f";

function eff(d: string | undefined, p: string | undefined): string {
  const dv = (d ?? "").trim();
  return dv || (p ?? "").trim() || "—";
}

const PROVIDER_LABEL: Record<string, string> = {
  swisscom: "Swisscom", sunrise: "Sunrise", salt: "Salt", quickline: "Quickline", yallo: "Yallo / anderer", other: "noch offen",
};
const PICKUP_LABEL: Record<string, string> = {
  sofort: "Sofort", nach_10s: "nach ~10 Sek.", nach_15s: "nach ~15 Sek.", nach_20s: "nach ~20 Sek.", nach_30s: "nach ~30 Sek.",
};
const DISPO_LABEL: Record<DispositionKey, string> = {
  d1_auftrag: "Neuer Auftrag", d2_info: "Info-Frage", d3_rueckruf: "Rückruf / Chef sprechen",
  d4_nachfrage: "Nachfrage laufender Auftrag", d5_reklamation: "Reklamation", d6_privat: "Privat / Werbung",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "" || value === "—") return null;
  return (
    <div style={{ display: "flex", gap: 16, padding: "5px 0", borderBottom: "1px solid #eee", fontSize: 13.5 }}>
      <div style={{ width: 210, flexShrink: 0, color: "#666" }}>{label}</div>
      <div style={{ color: "#111", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 22, breakInside: "avoid" }}>
      <h2 style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: GOLD, fontWeight: 700, margin: "0 0 6px", borderBottom: `2px solid ${GOLD}`, paddingBottom: 4 }}>{title}</h2>
      {children}
    </section>
  );
}

export default async function Zusammenfassung({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session: CockpitSession | null = /^[0-9a-f]{24}$/i.test(token) ? await getCockpitSessionByToken(token) : null;

  if (!session) {
    return (
      <main style={{ maxWidth: 640, margin: "80px auto", fontFamily: "system-ui, sans-serif", textAlign: "center", color: "#444" }}>
        <p>Diese Übersicht ist nicht verfügbar. Bitte öffnen Sie sie über Ihren Cockpit-Link.</p>
      </main>
    );
  }

  const d: CockpitDraft = session.draft ?? {};
  const pf = session.prefill;
  const v = d.voice ?? {};
  const r = d.review ?? {};
  const w = d.wizard ?? {};
  const cal = d.calendar ?? {};
  const msg = d.messages ?? {};
  const disp = v.dispositions ?? DISPOSITION_DEFAULTS;
  const staff = (d.staff ?? []).filter((s) => s.name?.trim());
  const thr = typeof r.internalThreshold === "number" ? r.internalThreshold : 3;
  const chan = (c: "sms" | "email" | undefined) => (c === "sms" ? "SMS" : "E-Mail");

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 28px 60px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#111", background: "#fff" }}>
      {/* Print CSS: weisser Hintergrund, Button ausblenden */}
      <style>{`@media print{.no-print{display:none!important}body{background:#fff}}@page{margin:16mm}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD, fontWeight: 700, margin: 0 }}>Ihr FlowSight-Setup</p>
          <h1 style={{ fontSize: 26, margin: "4px 0 0", color: "#0b1f33" }}>{session.company_name}</h1>
          <p style={{ fontSize: 12.5, color: "#777", margin: "4px 0 0" }}>Ihr Leitsystem — so ist es eingestellt. Aufbewahren als Nachschlagewerk.</p>
        </div>
        <PrintButton />
      </div>

      <Section title="Marke">
        <Row label="Fall-Kürzel" value={eff(d.branding?.caseIdPrefix, pf.branding.caseIdPrefix)} />
        <Row label="Farbe" value={eff(d.branding?.brandColor, pf.branding.brandColor)} />
      </Section>

      <Section title="Team & Rollen">
        {staff.length === 0 ? <Row label="Team" value="—" /> : staff.map((s, i) => (
          <Row key={i} label={s.role === "admin" ? "Leitung" : "Techniker"} value={`${s.name}${s.email ? " · " + s.email : ""}`} />
        ))}
      </Section>

      <Section title="Lisa — Ihre Telefon-Assistentin">
        <Row label="Begrüssung" value={eff(v.greetingText, pf.voice.greetingSuggestion)} />
        <Row label="Telefonanbieter" value={v.telco?.provider ? (PROVIDER_LABEL[v.telco.provider] || v.telco.otherName || v.telco.provider) : "—"} />
        <Row label="Lisa geht ran" value={v.pickup ? PICKUP_LABEL[v.pickup] : "—"} />
        <Row label="Notdienst" value={v.emergencyService === true ? "Ja" : v.emergencyService === false ? "Nein" : "—"} />
        {v.emergencyService ? <Row label="Notfall-Empfänger" value={[v.emergencyContact?.name, v.emergencyContact?.phone].filter(Boolean).join(" · ") || "—"} /> : null}
        <Row label="An Feiertagen" value={v.holidaysClosed === false ? "geöffnet behandelt" : "geschlossen — Fall wird trotzdem aufgenommen"} />
        <Row label="Betriebsferien" value={(v.vacationNote ?? "").trim() || "—"} />
        <Row label="Öffnungszeiten" value={eff(v.wissen?.openingHours, pf.voice.wissen.openingHours)} />
        <Row label="Einzugsgebiet" value={eff(v.wissen?.serviceArea, pf.voice.wissen.serviceArea)} />
      </Section>

      <Section title="Was Lisa bei welchem Anruf tut">
        {(Object.keys(DISPO_LABEL) as DispositionKey[]).map((k) => (
          <Row key={k} label={DISPO_LABEL[k]} value={`${disp[k].korb === "fall" ? "Fall" : disp[k].korb === "nachricht" ? "Nachricht" : "kein Fall"}${disp[k].notify === "push" ? " · Sofort-Alarm" : ""}`} />
        ))}
      </Section>

      <Section title="Online-Meldeformular">
        <Row label="Eigene Website" value={w.hasWebsite === true ? "Ja" : w.hasWebsite === false ? "Nein" : "—"} />
        <Row label="Verteilung" value={w.distribution ?? "—"} />
        {w.distribution === "embed" ? <Row label="Einbau durch" value={w.embedBy ?? "—"} /> : null}
        {w.agencyName || w.agencyEmail ? <Row label="Web-Agentur" value={[w.agencyName, w.agencyEmail].filter(Boolean).join(" · ")} /> : null}
      </Section>

      <Section title="Benachrichtigungen & E-Mail">
        <Row label="Neue Fälle an" value={r.notificationEmail || "—"} />
        <Row label="Empfangs-SMS" value={(msg.confirmSms ?? "").trim() || "Standard-Text"} />
        <Row label="Termin-Erinnerung" value={chan(msg.reminderChannel)} />
        <Row label="Bewertungsanfrage" value={`${chan(msg.reviewChannel)} · von Ihnen ausgelöst (max. 2 / Kunde)`} />
        <Row label="Rückrufe auch per E-Mail" value={r.notifyMessagesByEmail ? "Ja" : "Nein"} />
      </Section>

      <Section title="Bewertungen">
        <Row label="Google-Bewertungslink" value={r.googleReviewUrl || "—"} />
        <Row label="Place-ID / Profil" value={r.googlePlaceId || "—"} />
        <Row label="Intern statt öffentlich" value={thr === 0 ? "keine — alle öffentlich" : `Bewertungen mit ≤ ${thr} Sternen`} />
        <Row label="SMS-Absender" value={eff(r.smsSenderName, pf.review.smsSenderName)} />
      </Section>

      <Section title="Kalender">
        <Row label="Anbindung" value={cal.connect ? (cal.provider === "outlook" ? "Microsoft 365 / Outlook" : cal.provider === "google" ? "Google (in Vorbereitung)" : "Ja") : "nicht angebunden"} />
        {cal.connect && (cal.adminName || cal.adminEmail) ? <Row label="Microsoft-Admin" value={[cal.adminName, cal.adminEmail].filter(Boolean).join(" · ")} /> : null}
      </Section>

      <Section title="Zugang & Recht">
        <Row label="Login-E-Mail" value={d.golive?.adminEmail || "—"} />
        <Row label="AVV akzeptiert" value={d.golive?.avvAccepted ? `Ja${d.golive.avvVersion ? " · " + d.golive.avvVersion : ""}` : "noch offen"} />
      </Section>

      <p style={{ marginTop: 32, fontSize: 11, color: "#999", borderTop: "1px solid #eee", paddingTop: 10 }}>
        FlowSight · Oberrieden · Stand: dieser Ausdruck. Änderungen jederzeit über Ihr Cockpit / Leitsystem möglich.
      </p>
    </main>
  );
}
