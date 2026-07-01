import type { Metadata } from "next";
import HeroProof, { type Knoten } from "./HeroProof";

// Struktur-Vorschau der neuen „1 Hero + Knoten"-Beweis-Seite (Stern 3).
// Kein DB-Eintrag, keine echten Videos — zum Durchklicken/Review am Handy.
// NIE indexieren.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Vorschau — Hero + Knoten",
};

// Labels = Fragen des Inhabers (nicht Features) — Wortlaut aus HERO_DEMO_SPEC.md.
const KNOTEN: Knoten[] = [
  { key: "k1", frage: "Wie redet Lisa mit meinem Kunden?", unter: "Drei echte Anrufe — hören Sie selbst." },
  { key: "k2", frage: "Behalte ich wirklich den Überblick?", unter: "Eine Liste, auf Ihrem Handy." },
  { key: "k3", frage: "Ehrlich — wo ist der Haken?", unter: "Den sag ich Ihnen lieber selbst." },
  { key: "k4", frage: "Was kostet mich das — und wie komme ich da wieder raus?", unter: "Geradeheraus, ohne Kleingedrucktes." },
];

export default function HeroVorschauPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0b1f33] text-slate-100">
      <div className="bg-[#d4a843]/10 px-4 py-2 text-center text-xs text-[#d4a843]">
        Vorschau — Struktur „1 Hero + Knoten“ (Platzhalter, kein echtes Video)
      </div>
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-6 sm:py-10">
        <HeroProof companyName="Muster Sanitär AG" knoten={KNOTEN} demo />
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">Oberrieden</footer>
    </div>
  );
}
