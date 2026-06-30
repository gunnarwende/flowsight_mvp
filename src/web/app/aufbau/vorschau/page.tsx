import type { Metadata } from "next";
import { CockpitApp } from "../[token]/CockpitApp";
import { DEMO_COCKPIT_SESSION } from "@/src/lib/cockpit/demoSession";

/**
 * /aufbau/vorschau — das Cockpit (Stern 6) mit einer Demo-Session, ohne DB.
 *
 * Zweck: Der Founder kann den Aufbau am Handy durchklicken (mobile Review) und
 * die Verkaufs-Demo zeigt einem Betrieb „so erleben Sie das". `preview` schaltet
 * jedes Speichern/Senden ab — der Stand lebt nur im Browser, nichts wird scharf.
 * Privat: nie indexieren.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Cockpit-Vorschau",
};

export default function CockpitVorschauPage() {
  return <CockpitApp session={DEMO_COCKPIT_SESSION} preview />;
}
