import type { Metadata } from "next";
import { getCockpitSessionByToken } from "@/src/lib/cockpit/cockpitSessions";
import { CockpitApp } from "./CockpitApp";

/**
 * /aufbau/[token] — das Onboarding-COCKPIT (Phase 2, OC6).
 *
 * Der Co-Pilot, in dem der Betrieb sein System in ~1h selbst aufsetzt:
 * „Sie bauen Ihr System, wir führen Sie." Server-Component: Token → Session-
 * Lookup (DB, kein Filesystem) → rendert das interaktive Cockpit (Client) mit
 * der Vorbefüllung aus tenant_config (confirm-not-create) ODER einen
 * Fallback-Zustand (Link unbekannt / bereits abgesendet).
 *
 * Spec: docs/gtm/onboarding/phase2_cockpit_structure.md + phase2_cockpit_manifest.md
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

// Privat: NIE indexieren (token-geschützt, ein Link pro Betrieb).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Ihr Leitsystem aufbauen",
};

const BG = "#0b1f33";
const GOLD = "#c8a24a";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: BG, color: "#e8eef5" }}>
      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 py-7 sm:py-12">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">FlowSight · Oberrieden</footer>
    </div>
  );
}

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <div className="mx-auto mt-16 max-w-[460px] rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          FlowSight
        </p>
        <h1 className="mt-3 text-xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{body}</p>
      </div>
    </Shell>
  );
}

export default async function AufbauPage({ params }: PageProps) {
  const { token } = await params;

  if (!/^[0-9a-f]{24}$/i.test(token)) {
    return (
      <Centered
        title="Dieser Link ist ungültig"
        body="Bitte prüfen Sie den Link aus Ihrer E-Mail. Stimmt etwas nicht, melden Sie sich kurz bei Gunnar — er schickt Ihnen einen frischen Zugang."
      />
    );
  }

  const session = await getCockpitSessionByToken(token);
  if (!session) {
    return (
      <Centered
        title="Zugang nicht gefunden"
        body="Dieser Aufbau-Link existiert nicht (mehr). Melden Sie sich kurz bei Gunnar, dann bekommen Sie einen neuen."
      />
    );
  }

  if (session.status !== "building") {
    const msg =
      session.status === "live"
        ? "Ihr System ist live — alles eingerichtet. Bei Fragen ist Gunnar für Sie da."
        : "Vielen Dank — Sie haben Ihr System abgeschickt. Gunnar schaut es kurz durch und meldet sich, dann gehen wir gemeinsam live. Nichts ist verloren.";
    return <Centered title={`${session.company_name}`} body={msg} />;
  }

  return <CockpitApp session={session} />;
}
