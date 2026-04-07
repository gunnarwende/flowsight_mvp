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
  /** Hauptüberschrift oben auf der Seite */
  headline: string;
  /** Persönlicher Intro-Text (Absätze mit \n\n trennen) */
  intro: string;
  /** Die 4 inhaltlichen Video-Module */
  modules: VorstellungModule[];
  /** Persönlicher Abschlusstext (erscheint UNTER den Modulen, kein Video) */
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
  headline: "Persönlich vorbereitet\nfür die Dörfler AG",
  intro: [
    "Nach Ihrem Einsatz bei uns in Oberrieden habe ich mir ein paar Gedanken gemacht — und für die Dörfler AG etwas Konkretes vorbereitet.",
    "In vier kurzen Abschnitten zeige ich Ihnen, wie das im Alltag Ihres Betriebs funktionieren könnte. Jeder Teil dauert nur ein bis zwei Minuten.",
  ].join("\n\n"),
  modules: [
    {
      title: "Ihr Alltag — und eine Frage",
      subtitle:
        "Was passiert, wenn Baustelle, Kundengespräch und neue Anfragen gleichzeitig kommen",
      videoUrl: null, // TODO: Loom-URL nach Aufnahme eintragen
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
      title: "Vom erledigten Fall zur Bewertung",
      subtitle:
        "Gute Arbeit gezielt sichtbar machen — unkompliziert, mit einem Klick",
      videoUrl: null,
    },
  ],
  closing: [
    "Mir ging es bei dem Ganzen um etwas sehr Einfaches: dass bei Ihnen im Alltag alles so ankommt, dass man direkt sinnvoll damit weiterarbeiten kann.",
    "Das spart Zeit und Nerven, schafft schneller Überblick und sorgt dafür, dass gute Arbeit am Ende auch auf die Aussenwirkung der Dörfler AG einzahlt.",
    "Ich möchte Ihnen damit nichts verkaufen. Mich würde einfach ehrlich interessieren, wie das auf Sie wirkt.",
    "Sie erreichen mich jederzeit — wir sind ja nur ein paar Strassen voneinander entfernt.",
  ].join("\n\n"),
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
