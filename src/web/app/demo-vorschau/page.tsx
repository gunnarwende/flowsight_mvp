import type { Metadata } from "next";
import DemoVorschau from "./DemoVorschau";

// Interne Design-Vorschau der neuen Demo-Architektur (Stern 3–4) mit Beispieldaten.
// Nicht indexieren — reine Review-Route, bis der Rahmen sitzt; danach wandert er
// in /p/[token] (config-/tenant-getrieben, M5).
export const metadata: Metadata = {
  title: "Demo-Architektur — Vorschau",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <DemoVorschau />;
}
