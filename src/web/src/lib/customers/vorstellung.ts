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
  headline: "Ein persönliches Leitsystem für die Dörfler AG",
  question:
    "Wie sorgen wir bei der Dörfler AG dafür, dass im Alltag nichts verloren geht — und man trotzdem direkt sauber weiterarbeiten kann?",
  valueProp:
    "Weniger geht verloren, der Überblick entsteht schneller, und gute Arbeit wird am Ende auch nach aussen sichtbar.",
  modules: [
    {
      title: "Ihr Alltag — und die eigentliche Frage",
      subtitle:
        "Baustelle, Kundengespräch und neue Anliegen gleichzeitig",
      videoUrl: null,
    },
    {
      title: "Wenn Sie gerade nicht direkt rangehen können",
      subtitle:
        "Das Anliegen wird sauber aufgenommen, ohne dass im Alltag etwas verloren geht",
      videoUrl: null,
    },
    {
      title: "Wenn ein Kunde lieber online meldet",
      subtitle:
        "Auch schriftlich landet alles im selben Ablauf",
      videoUrl: null,
    },
    {
      title: "Wie gute Arbeit sichtbar wird",
      subtitle:
        "Bewertungen gezielt anfragen — dann, wenn es wirklich passt",
      videoUrl: null,
    },
  ],
  closing:
    "Mich würde ehrlich interessieren,\nwie das auf Sie wirkt.\n\nSie erreichen mich jederzeit —\nwir sind ja nur ein paar Strassen voneinander entfernt.",
  contact: {
    name: "Gunnar Wende",
    phone: "+41 44 552 09 19",
    email: "gunnar.wende@flowsight.ch",
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
