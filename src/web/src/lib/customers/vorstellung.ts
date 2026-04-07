/* ------------------------------------------------------------------ */
/*  Vorstellung — persönliche Leitsystem-Präsentation pro Prospect    */
/*  Config-Datei: Inhalte + Loom-URLs hier pflegen.                   */
/*  Seite: /kunden/[slug]/vorstellung                                 */
/* ------------------------------------------------------------------ */

export interface VorstellungModule {
  title: string;
  subtitle: string;
  /** Loom URL — null = Platzhalter ("Video wird vorbereitet") */
  videoUrl: string | null;
  /** z.B. "1:45" — optional, wird unter dem Video angezeigt */
  duration?: string;
}

export interface VorstellungConfig {
  slug: string;
  /** Anrede für den Prospect (z.B. "Herr Dörfler") */
  anrede: string;
  /** Hauptüberschrift — kurz, persönlich */
  headline: string;
  /** Die Kernfrage (erscheint prominent im Hero) */
  question: string;
  /** Nutzenverdichtung — 1-2 Sätze direkt unter der Frage */
  valueProp: string;
  /** Die 4 inhaltlichen Video-Module */
  modules: VorstellungModule[];
  /** Kurzer persönlicher Abschluss (2-3 Sätze max) */
  closing: string;
  contact: {
    name: string;
    phone: string;
    email: string;
    location: string;
  };
}

/* ------------------------------------------------------------------ */
/*  DÖRFLER AG                                                        */
/* ------------------------------------------------------------------ */

const doerflerAg: VorstellungConfig = {
  slug: "doerfler-ag",
  anrede: "Herr Dörfler",
  headline: "Persönlich vorbereitet für die Dörfler AG",
  question:
    "Wie kommt bei einem Betrieb wie Ihrem im Alltag alles so an, dass man direkt sinnvoll damit weiterarbeiten kann?",
  valueProp:
    "Weniger geht verloren, der Überblick kommt schneller — und gute Arbeit zahlt am Ende auf die Aussenwirkung der Dörfler AG ein.",
  modules: [
    {
      title: "Ihr Alltag — und eine Frage",
      subtitle:
        "Baustelle, Kundengespräch und neue Anfragen gleichzeitig",
      videoUrl: null,
    },
    {
      title: "Wenn Sie gerade nicht rangehen können",
      subtitle:
        "Eine Assistentin übernimmt — mit dem Namen der Dörfler AG",
      videoUrl: null,
    },
    {
      title: "Wenn ein Kunde lieber online meldet",
      subtitle:
        "Ein sauberer Weg über Ihre Website — direkt in dieselbe Übersicht",
      videoUrl: null,
    },
    {
      title: "Wie gute Arbeit sichtbar wird",
      subtitle:
        "Zufriedene Kunden gezielt zu einer Bewertung führen — im richtigen Moment",
      videoUrl: null,
    },
  ],
  closing:
    "Mich würde ehrlich interessieren, wie das auf Sie wirkt. Sie erreichen mich jederzeit — wir sind ja nur ein paar Strassen voneinander entfernt.",
  contact: {
    name: "Gunnar Wende",
    phone: "+41 44 552 09 19",
    email: "gunnar@flowsight.ch",
    location: "Oberrieden",
  },
};

/* ------------------------------------------------------------------ */
/*  Registry                                                          */
/* ------------------------------------------------------------------ */

const vorstellungen: Record<string, VorstellungConfig> = {
  "doerfler-ag": doerflerAg,
};

export function getVorstellung(
  slug: string
): VorstellungConfig | undefined {
  return vorstellungen[slug];
}

export function getAllVorstellungSlugs(): string[] {
  return Object.keys(vorstellungen);
}
