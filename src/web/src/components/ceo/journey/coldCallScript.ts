// Cold-Call-Wortlaut — 1:1 aus docs/gtm/sales/cold_call_script.md (frage-first, GELOCKT 2026-06-27).
// Stern 2. Ziel: das Ja, die kurze Seite schicken zu dürfen. Ehrlich, kein Druck, ein Nein sofort ehren.
// Quelle für Übersicht (Baum), Live, Drill.

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
  // ── §1 · Wer abhebt ───────────────────────────────────────────────
  start: {
    title: "Wer hebt ab?",
    say: "",
    choices: [
      { label: "Inhaber direkt", go: "opener" },
      { label: "Partnerin / jemand anderes", go: "gatekeeper" },
    ],
  },
  gatekeeper: {
    cue: "§1 · Wer abhebt — Lead (warm, kurz)",
    say: "Grüezi, Gunnar Wende aus Oberrieden. Ist Herr [Name] grad zu sprechen?",
    choices: [
      { label: "Verbindet zum Inhaber", go: "opener" },
      { label: "„Worum geht's denn?“", go: "gk_worum" },
      { label: "„Er ist grad nicht da“", go: "gk_nichtda" },
      { label: "„Wir brauchen nichts“ (Nein)", go: "exit_nein" },
      { label: "„Schicken Sie an info@“", go: "gk_info" },
    ],
  },
  gk_worum: {
    cue: "„Worum geht's denn?“ (Gatekeeper / Partnerin)",
    say: "Ganz kurz — ich hab was für Sanitärbetriebe gebaut, das auffängt, was im Tagesstress untergeht: eine Anfrage über Telefon, Website, egal wie. Wenn Sie die Anrufe machen, hält Ihnen das den Rücken frei. Ich hätt dazu eine kurze Frage an Herrn [Name] — wann erreich ich ihn?",
    choices: [
      { label: "Verbindet / „rufen Sie an“", go: "opener" },
      { label: "„Er ist grad nicht da“", go: "gk_nichtda" },
      { label: "„Nein, kein Bedarf“", go: "exit_nein" },
    ],
  },
  gk_nichtda: {
    cue: "„Er ist grad nicht da“ (Logistik, kein Nein)",
    say: "Kein Problem — wann erreich ich ihn am besten, früh oder gegen Abend?",
    choices: [{ label: "Zeit notiert", go: "callback" }],
  },
  gk_info: {
    cue: "„Schicken Sie an info@“",
    say: "Könnt ich — aber ehrlich, es ist nur eine kurze Frage, die ich ihm lieber selber stell. Wann erreich ich ihn am besten?",
    choices: [
      { label: "Zeit notiert", go: "callback" },
      { label: "Verbindet doch", go: "opener" },
    ],
  },

  // ── §2 · Opener ───────────────────────────────────────────────────
  opener: {
    cue: "§2 · Opener (~22–25 Sek, dann STOPP)",
    say: "Grüezi Herr [Name], Gunnar Wende aus Oberrieden.\n\nIch mach's ganz kurz — Sie stecken sicher mitten in der Arbeit.\n\nBei [Betrieb] machen Sie das meiste selber — und sind oft selber unterwegs. Das schätz ich.\n\nNur — genau dann klingelt's. Und wer Sie grad nicht erreicht, wartet nicht. Der ruft den Nächsten an.\n\nDarf ich Ihnen eine Frage aus Ihrem Alltag stellen?",
    choices: [
      { label: "„Ja“ (Frage erlaubt)", go: "s3_aufsetzer" },
      { label: "„Keine Zeit“", go: "ex_keineZeit" },
      { label: "„Wer sind Sie / ist das Werbung?“", go: "ex_werSind" },
      { label: "„Was kostet das?“", go: "ex_preis" },
      { label: "„Läuft schon / haben ein System“", go: "ex_laeuftSchon" },
      { label: "„Kein Interesse“ (Nein)", go: "exit_nein" },
    ],
  },

  // ── §3 · Discovery — Aufsetzer → 4 Auffahrten → Killer ────────────
  s3_aufsetzer: {
    cue: "§3 · Aufsetzer — dann ZUHÖREN, schweigen",
    say: "Wenn Sie grad auf dem Einsatz sind und's klingelt — was passiert dann mit dem Anruf?",
    choices: [
      { label: "„Geht auf die Combox“", go: "s3_combox" },
      { label: "„Meine Frau / das Büro“", go: "s3_buero" },
      { label: "„Ich ruf zurück / seh die Nummer“", go: "s3_rueckruf" },
      { label: "„Geht halt verloren“", go: "s3_verloren" },
      { label: "Abwehr: „bei mir klappt das“", go: "s3_abwehr" },
    ],
  },
  s3_combox: {
    cue: "Auffahrt Combox → Killer (dann SCHWEIGEN)",
    say: "Und die, die nichts draufsprechen — und das sind die meisten — die kriegen Sie mit? Oder sind die einfach weg?",
    choices: [
      { label: "„…eigentlich nicht“ (Wunde sitzt)", go: "s4" },
      { label: "Abwehr „klappt schon“", go: "s3_abwehr" },
    ],
  },
  s3_buero: {
    cue: "Auffahrt Frau/Büro → Killer",
    say: "Macht sie sicher top. Und wenn sie grad selber unterwegs ist — Mittag, Samstag? Kriegen Sie das dann mit, oder sind die einfach weg?",
    choices: [
      { label: "„…eigentlich nicht“", go: "s4" },
      { label: "Abwehr „klappt schon“", go: "s3_abwehr" },
    ],
  },
  s3_rueckruf: {
    cue: "Auffahrt Rückruf / sieht Nummer → Killer",
    say: "Und die, die zwischendurch schon wen anders angerufen haben — kriegen Sie die mit? Oder sind die einfach weg?",
    choices: [
      { label: "„…eigentlich nicht“", go: "s4" },
      { label: "Abwehr „klappt schon“", go: "s3_abwehr" },
    ],
  },
  s3_verloren: {
    cue: "„Geht verloren“ — er sagt den Killer selbst",
    say: "Und wissen Sie, wie viele das im Monat sind?",
    choices: [{ label: "„…keine Ahnung“ → weiter", go: "s4" }],
  },
  s3_abwehr: {
    cue: "Sonderfall Abwehr — nicht streiten",
    say: "Glaub ich Ihnen. Und wenn doch mal zwei Sachen gleichzeitig reinkommen und einer rutscht durch — würden Sie das überhaupt merken?",
    choices: [
      { label: "„…eigentlich nicht“", go: "s4" },
      { label: "Festes Nein", go: "exit_nein" },
    ],
  },

  // ── §4 · Übergang zum Video / CTA ─────────────────────────────────
  s4: {
    cue: "§4 · Brücke „Das ist der Punkt.“ (Pause) + CTA",
    say: "Das ist der Punkt.\n\nUnd dafür hab ich was gebaut. Ich nehm bewusst nur ein paar Betriebe — jeder kriegt seine eigene Seite und meine volle Aufmerksamkeit.\n\nIn 90 Sekunden sehen Sie, wie bei Ihnen keine Anfrage mehr verloren geht — auch wenn Sie grad nicht dazukommen.\n\nSchauen Sie's in Ruhe an — Sie sehen sofort, ob's für Ihren Betrieb passt.\n\n[Beat — er reagiert, meist „ja, schicken Sie“]\n\nIch schick's Ihnen rüber, dann haben Sie's — auf welche Mail?\n\nIch meld mich in ein, zwei Tagen, dann schauen wir kurz, ob's für Sie passt.",
    choices: [
      { label: "„Ja, auf welche Mail“", go: "mail" },
      { label: "„Was kostet das?“", go: "ex_preis" },
      { label: "„Schicken Sie Unterlagen“", go: "ex_unterlagen" },
      { label: "„Schauen, aber nicht nachrufen“", go: "ex_nichtNachrufen" },
      { label: "„Kein Interesse“ (Nein)", go: "exit_nein" },
    ],
  },
  mail: {
    cue: "Mail sichern (souverän-assumptiv)",
    say: "[Mail notieren.] Ich wiederhole kurz: [Mailadresse].\n\nPasst — ich schick's Ihnen gleich rüber. Bis in ein, zwei Tagen.",
    choices: [{ label: "Bestätigt — Ja zur Seite", go: "win" }],
  },

  // ── §5 · Exits (Nein ehren / Frage ehrlich beantworten) ───────────
  ex_keineZeit: {
    cue: "„Keine Zeit“ (Logistik, kein Nein)",
    say: "Klar, ich halt Sie nicht auf — wann erreich ich Sie besser, Mittag oder Abend?",
    choices: [
      { label: "Zeit notiert", go: "callback" },
      { label: "„Nein“", go: "exit_nein" },
    ],
  },
  ex_preis: {
    cue: "„Was kostet das?“",
    say: "Berechtigte Frage. Ehrlich — eine Zahl nenn ich ungern, bevor Sie's gesehen haben; sonst reden wir über Geld für was, das Sie noch gar nicht kennen.\n\nSchauen Sie die kurze Seite an, danach sehen Sie selbst, ob's den Aufwand wert ist — und dann reden wir konkret.",
    choices: [
      { label: "„Okay, schicken Sie“", go: "s4" },
      { label: "„Nein“", go: "exit_nein" },
    ],
  },
  ex_werSind: {
    cue: "„Wer sind Sie? Ist das Werbung?“",
    say: "Gunnar Wende, aus Oberrieden. Ich bau ein System für Sanitärbetriebe, damit im Tagesstress keine Anfrage untergeht — und fang grad mit den ersten in der Region an, drum ruf ich selber an.",
    choices: [
      { label: "„Okay, worum geht's“ → Frage", go: "s3_aufsetzer" },
      { label: "„Kein Interesse“", go: "exit_nein" },
    ],
  },
  ex_unterlagen: {
    cue: "„Schicken Sie Unterlagen“",
    say: "Gern — keine Standard-Unterlagen, sondern eine kurze Seite, die ich für [Betrieb] mache. Auf welche Mail?",
    choices: [{ label: "Mail nennt er", go: "mail" }],
  },
  ex_laeuftSchon: {
    cue: "„Läuft schon / wir haben ein System“",
    say: "Das ist gut. Trotzdem eine ehrliche Frage: Kriegen Sie auch die mit, die im Tagesstress mal untergehen — oder fallen die einfach unter den Tisch?",
    choices: [
      { label: "Beißt an → weiter", go: "s4" },
      { label: "Zuckt mit den Schultern → ehren", go: "exit_nein" },
    ],
  },
  ex_nichtNachrufen: {
    cue: "„Schauen — aber rufen Sie nicht nach“",
    say: "Natürlich. Ich schick's Ihnen, Sie schauen in Ruhe — wenn's Sie überzeugt, melden Sie sich einfach.",
    choices: [{ label: "Mail nennt er", go: "mail" }],
  },

  // ── Ausgänge ──────────────────────────────────────────────────────
  exit_nein: {
    cue: "„Kein Interesse / brauchen nichts“",
    say: "Alles gut — danke, dass Sie's direkt sagen. Schönen Tag.",
    choices: [{ label: "Auflegen, nächster", go: "end" }],
  },
  callback: {
    result: "rep",
    title: "Rückruf-Zeit notiert.",
    note: "Kein Nein — nur „nicht jetzt“. Zeit eintragen, später nochmal. Nächster Call.",
  },
  win: {
    result: "win",
    title: "Volltreffer — Ja zur Seite.",
    note: "Heute noch: personalisierte Seite bauen + senden (~35 Min). Folge-Anruf in 1–2 Tagen steht. Das triggert die Pipeline.",
  },
  end: {
    result: "rep",
    title: "Sauberes Nein — Rep gesammelt.",
    note: "Ein ehrlich respektiertes Nein schützt Ruf + Energie. Kein Drehen. Kurz in die Lessons, nächster Call.",
  },
};

// Drill: Einwand → Antwort aktiv abrufen (§5 + Gatekeeper-Kernstrang).
const DRILL_IDS = [
  "ex_preis", "ex_laeuftSchon", "ex_werSind", "ex_keineZeit",
  "ex_unterlagen", "ex_nichtNachrufen", "gk_worum", "exit_nein",
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
