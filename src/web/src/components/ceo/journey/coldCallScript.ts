// Cold-Call-Wortlaut — 1:1 aus docs/gtm/sales/cold_call_script.md (EINGEFROREN).
// Stern 2 der Customer Journey. Ziel: das Ja, die Simulation schicken zu dürfen.
// Kein Preis, keine Discovery. Quelle für Übersicht (Baum), Live, Drill.

export interface ColdChoice {
  label: string;
  go: string;
}
export interface ColdNode {
  cue?: string;
  say?: string;
  choices?: ColdChoice[];
  result?: "win" | "rep";
  title?: string;
  note?: string;
}

export const COLD: Record<string, ColdNode> = {
  start: {
    title: "Wer hebt ab?",
    say: "",
    choices: [
      { label: "Inhaber direkt", go: "opener" },
      { label: "Mitarbeiter / Büro", go: "gatekeeper" },
    ],
  },
  gatekeeper: {
    cue: "Gatekeeper",
    say: "Grüezi, Gunnar Wende hier. Ich hätte eine kurze Frage an Herrn [Name] — es geht um neue Kundenanfragen bei [Betrieb] und einen konkreten Vorschlag dazu. Ist er gerade kurz erreichbar?",
    choices: [
      { label: "„Worum geht es genau?“", go: "gk_worum" },
      { label: "„Schicken Sie an info@…“", go: "gk_info" },
      { label: "Verbindet zum Inhaber", go: "opener" },
    ],
  },
  gk_worum: {
    cue: "Worum geht es?",
    say: "Es geht um ein Leitsystem: Neue Kundenanfragen über Telefon, Website oder direkt aus einem Gespräch heraus laufen an einem Ort zusammen. So sieht Herr [Name], was eingegangen ist, was offen ist und was weiterlaufen muss. Ich würde ihn dazu gerne kurz persönlich fragen, ob das für [Betrieb] überhaupt ein Thema ist.",
    choices: [
      { label: "Verbindet zum Inhaber", go: "opener" },
      { label: "„An info@ schicken“", go: "gk_info" },
    ],
  },
  gk_info: {
    cue: "„An info@ schicken“",
    say: "Gerne, das kann ich machen.\n\nNur damit es nicht irgendwo untergeht: Es ist bewusst für Herrn [Name] vorbereitet. Gibt es eine direkte Mailadresse von ihm — oder soll ich es an info@ schicken und an Herrn [Name] adressieren?\n\nWenn nur info@ möglich ist:\nAlles klar, dann schicke ich es an info@ und adressiere es direkt an Herrn [Name].\n\nWäre es sinnvoll, wenn ich morgen oder übermorgen nochmals kurz nachfasse, ob es bei ihm angekommen ist?",
    choices: [{ label: "Notiert — Ende", go: "end" }],
  },
  opener: {
    cue: "Opener Inhaber",
    say: "Grüezi Herr [Name], Gunnar Wende aus Oberrieden.\n\nIch mache es kurz, weil Sie wahrscheinlich mitten im Tagesgeschäft sind: Ich habe mir [Betrieb] angeschaut und etwas Konkretes zu Ihren Kundenanfragen vorbereitet.\n\nDarf ich Ihnen in 30 Sekunden sagen, warum ich konkret Sie anrufe?",
    choices: [
      { label: "„Ja“ (30 Sekunden)", go: "s30" },
      { label: "„Keine Zeit“", go: "keineZeit" },
      { label: "„Was kostet das?“", go: "preis" },
      { label: "„Kein Interesse“", go: "keinInteresse" },
      { label: "„Wir haben genug Anfragen“", go: "genug" },
      { label: "„Wir haben schon ein System“", go: "system" },
      { label: "„Schicken Sie Unterlagen“", go: "unterlagen" },
      { label: "„Wer sind Sie?“", go: "werSind" },
    ],
  },
  s30: {
    cue: "Er gibt 30 Sekunden",
    say: "Danke.\n\nDer Punkt ist einfach: Bei [Gewerk] kommen neue Kundenanfragen heute über verschiedene Wege rein — Telefon, Website, E-Mail oder direkt aus einem Gespräch heraus.\n\nUnd wenn im Tagesgeschäft viel gleichzeitig läuft, ist genau die Frage: Bleibt am Ende wirklich alles sichtbar — was reingekommen ist, was offen ist und was weiterlaufen muss?\n\nGenau dafür habe ich etwas Konkretes für Ihren Betrieb vorbereitet: eine kurze, für Ihren Betrieb vorbereitete Videoseite, auf der Sie direkt sehen, wie neue Kundenanfragen bei Ihnen nicht mehr verloren gehen, sondern sichtbar aufgenommen, weitergeführt und sauber abgeschlossen werden.\n\nDarf ich Ihnen den Link per Mail schicken und mich morgen oder übermorgen nochmals kurz melden?",
    choices: [
      { label: "„Ja, schicken Sie es mir“", go: "ja" },
      { label: "„Was kostet das?“", go: "preis" },
      { label: "„Kein Interesse“", go: "keinInteresse" },
      { label: "„Schauen, aber nicht nachrufen“", go: "nichtNachrufen" },
    ],
  },
  keineZeit: {
    cue: "„Keine Zeit“",
    say: "Verstehe ich, dann will ich Sie nicht aufhalten.\n\nDann nur ganz kurz: Ich habe etwas Konkretes für Ihren Betrieb vorbereitet — eine kurze Videoseite, auf der Sie direkt sehen, wie neue Kundenanfragen bei Ihnen nicht mehr verloren gehen, sondern sichtbar aufgenommen, weitergeführt und sauber abgeschlossen werden.\n\nDarf ich Ihnen den Link per Mail schicken und mich danach einmal kurz melden?",
    choices: [
      { label: "„Ja, schicken Sie“", go: "ja" },
      { label: "„Nein“", go: "nein" },
    ],
  },
  preis: {
    cue: "„Was kostet das?“",
    say: "Verstehe ich, die Frage ist völlig berechtigt.\n\nIch würde Ihnen jetzt am Telefon aber ungern eine Zahl nennen, bevor Sie gesehen haben, was ich für Ihren Betrieb vorbereitet habe. Schauen Sie sich zuerst die kurze Videoseite in Ruhe an.\n\nWenn Sie danach sagen, das bringt Ihnen keinen konkreten Nutzen, dann ist das Thema erledigt. Wenn Sie sagen, das trifft einen Punkt, dann sprechen wir sauber über Aufwand und Kosten.\n\nDarf ich Ihnen den Link schicken?",
    choices: [
      { label: "„Ja, schicken Sie“", go: "ja" },
      { label: "„Kein Interesse“", go: "keinInteresse" },
    ],
  },
  keinInteresse: {
    cue: "„Kein Interesse“",
    say: "Verstehe ich, das ist völlig in Ordnung.\n\nNur damit ich Sie richtig einordne: Ist das Thema bei Ihnen bereits sauber gelöst — oder möchten Sie sich gerade grundsätzlich nicht damit beschäftigen?",
    choices: [
      { label: "„Bei uns läuft das schon“", go: "laeuftSchon" },
      { label: "„Möchte mich nicht beschäftigen“", go: "nichtBeschaeftigen" },
    ],
  },
  laeuftSchon: {
    cue: "„Bei uns läuft das schon“",
    say: "Das ist gut.\n\nGenau deshalb will ich es Ihnen auch nicht am Telefon erklären. Ich habe es bewusst konkret für Ihren Betrieb vorbereitet. Schauen Sie sich die kurze Videoseite einfach als Vergleich an. Wenn Sie darin keinen zusätzlichen Nutzen sehen, ist das Thema für mich erledigt.\n\nDarf ich Ihnen den Link schicken?",
    choices: [
      { label: "„Ja, schicken Sie“", go: "ja" },
      { label: "„Nein“", go: "nein" },
    ],
  },
  nichtBeschaeftigen: {
    cue: "„Möchte mich nicht beschäftigen“",
    say: "Verstehe ich. Dann respektiere ich das und will Ihnen nichts aufdrängen.\n\nDanke für die klare Rückmeldung, Herr [Name]. Ich wünsche Ihnen einen guten Tag.",
    choices: [{ label: "Ende", go: "end" }],
  },
  genug: {
    cue: "„Wir haben genug Anfragen“",
    say: "Das ist gut — und genau da setzt es eigentlich an.\n\nMir geht es nicht darum, Ihnen noch mehr Anfragen zu bringen. Der Punkt ist eher: Wenn viele Anfragen reinkommen, wird es umso wichtiger, dass sichtbar bleibt, was eingegangen ist, was offen ist und was weiterlaufen muss.\n\nIch habe das bewusst konkret für Ihren Betrieb vorbereitet. Schauen Sie sich die kurze Videoseite einfach als Vergleich an. Wenn Sie darin keinen zusätzlichen Nutzen sehen, ist das Thema für mich erledigt.\n\nDarf ich Ihnen den Link schicken?",
    choices: [
      { label: "„Ja, schicken Sie“", go: "ja" },
      { label: "„Nein“", go: "nein" },
    ],
  },
  system: {
    cue: "„Wir haben schon ein System“",
    say: "Das ist gut — dann haben Sie bereits eine Grundlage.\n\nMir geht es auch nicht darum, am Telefon zu behaupten, dass Sie etwas ersetzen müssen. Der Punkt ist eher, ob neue Kundenanfragen aus Telefon, Website, E-Mail und direkten Gesprächen wirklich an einem Ort sichtbar weiterlaufen.\n\nIch habe das bewusst konkret für Ihren Betrieb vorbereitet. Schauen Sie sich die kurze Videoseite einfach als Vergleich an. Wenn Sie darin keinen zusätzlichen Nutzen sehen, ist das Thema für mich erledigt.\n\nDarf ich Ihnen den Link schicken?",
    choices: [
      { label: "„Ja, schicken Sie“", go: "ja" },
      { label: "„Nein“", go: "nein" },
    ],
  },
  unterlagen: {
    cue: "„Schicken Sie Unterlagen“",
    say: "Gerne.\n\nIch schicke Ihnen aber keine allgemeinen Unterlagen, sondern den Link zur kurzen Videoseite, die ich bewusst konkret für Ihren Betrieb vorbereitet habe.\n\nDort sehen Sie deutlich schneller, ob darin ein konkreter Nutzen für [Betrieb] steckt.\n\nWas ist für Sie besser — per Mail oder direkt aufs Handy?",
    choices: [{ label: "Kanal nennt er → bestätigen", go: "bestaetigen" }],
  },
  werSind: {
    cue: "„Wer sind Sie genau?“",
    say: "Gerne.\n\nMein Name ist Gunnar Wende, ich bin aus Oberrieden. Ich baue ein Leitsystem für Sanitärbetriebe, damit neue Kundenanfragen aus Telefon, Website, E-Mail und direkten Gesprächen an einem Ort sichtbar weiterlaufen.\n\nIch habe mir [Betrieb] angeschaut und deshalb etwas Konkretes für Ihren Betrieb vorbereitet.\n\nDarf ich Ihnen den Link zur kurzen Videoseite schicken?",
    choices: [
      { label: "„Welche Firma?“", go: "welcheFirma" },
      { label: "„Ja, schicken Sie“", go: "ja" },
    ],
  },
  welcheFirma: {
    cue: "„Welche Firma?“",
    say: "Ich baue das unter dem Namen FlowSight auf — aber der Name ist hier gar nicht der wichtige Punkt.\n\nWichtiger ist: Ich habe für [Betrieb] konkret vorbereitet, wie neue Kundenanfragen sichtbarer aufgenommen und weitergeführt werden können.\n\nDarf ich Ihnen den Link zur kurzen Videoseite schicken?",
    choices: [{ label: "„Ja, schicken Sie“", go: "ja" }],
  },
  nichtNachrufen: {
    cue: "„Schauen, aber nicht nachrufen“",
    say: "Natürlich, das respektiere ich.\n\nDann schicke ich Ihnen den Link einfach zu. Schauen Sie es sich in Ruhe an — ich habe es bewusst konkret für Ihren Betrieb vorbereitet.\n\nWenn Sie darin einen konkreten Nutzen für [Betrieb] sehen, können Sie mir direkt auf die Mail antworten. Wenn nicht, müssen Sie nichts machen.",
    choices: [{ label: "Kanal abfragen → bestätigen", go: "bestaetigen" }],
  },
  ja: {
    cue: "„Ja, schicken Sie es mir“",
    say: "Sehr gerne.\n\nWas ist für Sie besser — per Mail oder direkt aufs Handy?\n\n[Pause. Adresse notieren.]\n\nPerfekt, danke. Dann schicke ich Ihnen den Link zur kurzen Videoseite. Ich habe es bewusst konkret für Ihren Betrieb vorbereitet — schauen Sie es sich einfach in Ruhe an.\n\nIch melde mich morgen oder übermorgen nochmals kurz und frage nur, ob Sie darin einen konkreten Nutzen für Ihren Betrieb sehen.\n\nPasst das so?",
    choices: [
      { label: "Adresse bestätigen", go: "bestaetigen" },
      { label: "Lieber Rückruf statt Mail", go: "rueckruf" },
    ],
  },
  bestaetigen: {
    cue: "Mailadresse bestätigen",
    say: "Perfekt, danke.\n\nIch wiederhole kurz: [Mailadresse wiederholen].\n\nStimmt das so?\n\nWenn schwierig:\nDanke. Damit ich es sauber notiere: Können Sie mir die Adresse kurz buchstabieren?\n\n[Adresse wiederholen.]\n\nPerfekt, stimmt das so?",
    choices: [{ label: "Bestätigt → Abschluss", go: "abschlussPositiv" }],
  },
  abschlussPositiv: {
    cue: "Abschluss positiv",
    say: "Perfekt, danke. Dann schicke ich Ihnen den Link gleich per Mail.\n\nSchauen Sie es sich einfach in Ruhe an — ich habe es bewusst konkret für Ihren Betrieb vorbereitet.\n\nIch melde mich morgen oder übermorgen nochmals kurz und frage nur, ob Sie darin einen konkreten Nutzen für [Betrieb] sehen.\n\nPasst das so?",
    choices: [{ label: "Geschafft", go: "win" }],
  },
  rueckruf: {
    cue: "Rückruf statt Mail",
    say: "Alles klar, dann rufe ich Sie lieber nochmals an.\n\nWann erwische ich Sie besser — eher über Mittag oder gegen Abend?",
    choices: [{ label: "Termin notiert", go: "win" }],
  },
  nein: {
    cue: "Klares Nein",
    say: "Verstehe ich. Dann respektiere ich das und will Ihnen nichts aufdrängen.\n\nDanke für die klare Rückmeldung, Herr [Name]. Ich wünsche Ihnen einen guten Tag.",
    choices: [{ label: "Ende", go: "end" }],
  },
  win: {
    result: "win",
    title: "Volltreffer — Ja zur Simulation.",
    note: "Heute noch: Simulation bauen + senden (~35 Min). Folge-Anruf steht. Das triggert die Pipeline.",
  },
  end: {
    result: "rep",
    title: "Rep gesammelt.",
    note: "Jeder Nein bringt dich näher zum Ja. Kurz in die Lessons, nächster Call.",
  },
};

export const JA = new Set(["ja", "bestaetigen", "abschlussPositiv", "win", "rueckruf", "unterlagen", "welcheFirma"]);
export const EXIT = new Set(["nein", "end", "nichtBeschaeftigen", "gk_info"]);
export const dcls = (id: string): "ja" | "exit" | "mid" => (JA.has(id) ? "ja" : EXIT.has(id) ? "exit" : "mid");

// Drill: Einwand → Antwort aktiv abrufen.
export const DRILL_IDS = [
  "preis", "keineZeit", "keinInteresse", "laeuftSchon", "genug", "system",
  "unterlagen", "werSind", "welcheFirma", "nichtNachrufen", "gk_worum", "gk_info",
];
export const DRILL = DRILL_IDS.map((id) => ({ cue: COLD[id].cue ?? "", answer: COLD[id].say ?? "" }));

/** [Betrieb]/[Name]/[Gewerk]-Platzhalter im Live-Modus mit dem aktuellen Lead füllen. */
export function injectColdText(s: string, biz: { firma?: string; name?: string | null; gewerk?: string } | null): string {
  if (!s) return s;
  return s
    .replace(/\[Betrieb\]/g, biz?.firma || "[Betrieb]")
    .replace(/\[Name\]/g, biz?.name || "[Name]")
    .replace(/\[Gewerk\]/g, biz?.gewerk || "einem Betrieb wie Ihrem");
}

/** 2–3 Kern-Gewerke aus den Leistungen für den Live-Satz (kein Leistungs-Dump). */
export function gewerkPhrase(services: string, firma: string): string {
  const src = ((services || "") + " " + (firma || "")).toLowerCase();
  const map: [RegExp, string][] = [
    [/sanit/, "Sanitär"], [/heiz/, "Heizung"], [/l[üu]ft/, "Lüftung"], [/klima/, "Klima"],
    [/k[äa]lte/, "Kälte"], [/spengler/, "Spenglerei"], [/solar/, "Solar"], [/w[äa]rmepump/, "Wärmepumpen"],
    [/bad/, "Badumbau"], [/geb[äa]udetech/, "Gebäudetechnik"], [/haustech/, "Haustechnik"],
  ];
  const found: string[] = [];
  for (const [rx, lab] of map) {
    if (rx.test(src) && !found.includes(lab)) found.push(lab);
    if (found.length >= 3) break;
  }
  if (!found.length) return "einem Betrieb wie Ihrem";
  const list = found.length === 1 ? found[0] : found.slice(0, -1).join(", ") + " und " + found[found.length - 1];
  return "einem Betrieb wie Ihrem mit " + list;
}
