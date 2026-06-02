// Canonical Lisa agent lines for Take 2 call. Single source of truth.
// Numbering matches Final_generic_scripting.txt / notruf.txt / preis.txt agent turn index.
// Agent #1 contains {{tenant_display_name}} placeholder — tenant-specific.
// Agent #9 has two variants (Notruf/Preis).
// Agent #7 is in English (Juniper voice). All others German (Ela).
//
// IMPORTANT: Keep these strings in lockstep with notruf.txt/preis.txt.
//            Change either → change both.

export const AGENT_LINES = {
  1: {
    // tenant-specific; {{tenant_display_name}} replaced at render time
    text: "Hallo, hier ist Lisa — die digitale Assistentin {{tenant_connector}} {{tenant_display_name}}. Wie kann ich Ihnen helfen?",
    voice: "ela",
    lang: "de",
    kind: "tenant",
  },
  2: {
    text: "Natürlich, das machen wir gerne für Sie. Erzählen Sie doch kurz, was genau passiert ist.",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  3: {
    text: "Oh, das klingt wirklich unangenehm. Da kümmern wir uns natürlich sofort darum. Wissen Sie, woher das Wasser kommt? Ist es eher ein Leck an einer Leitung, oder läuft es aus einem Gerät aus?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  4: {
    text: "Verstehe, das klingt dringend, das nehme ich sofort auf. Wie lautet die Strasse und Hausnummer des Einsatzortes?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  5: {
    text: "Alles klar, danke. Und die Postleitzahl und der Ort?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  6: {
    text: "Perfekt. Und könnten Sie mir als letztes sagen, wo unser Techniker klingeln darf?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  7: {
    text: "Of course. I understand you have water in your basement — that sounds really stressful. Could you tell me where our technician should ring when they arrive?",
    voice: "juniper",
    lang: "en",
    kind: "generic",
  },
  8: {
    text: "Alles klar, ich mache auf Deutsch weiter. Wo darf unser Techniker klingeln?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  // 9 is variant-specific
  9: {
    notruf: {
      text: "Dann hätten Sie uns genauso erreicht. Ich nehme den Fall auch dann sofort auf und gebe ihn direkt an den zuständigen Techniker weiter. Bei Notfällen sind wir rund um die Uhr erreichbar, auch an Sonn- und Feiertagen. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?",
      voice: "ela",
      lang: "de",
      kind: "generic",
    },
    preis: {
      text: "Das kommt ganz auf die Ursache und den Aufwand an — aus der Ferne wäre das nicht seriös einzuschätzen. Unsere Techniker schauen sich das deshalb zuerst vor Ort an. Aber zurück zu Ihrem Anliegen: Wo darf unser Techniker bei Ihnen klingeln?",
      voice: "ela",
      lang: "de",
      kind: "generic",
    },
  },
  10: {
    text: "Nein, dafür sind wir leider nicht zuständig. Aber zurück zum Wasserschaden: Wo darf unser Techniker klingeln, wenn er bei Ihnen eintrifft?",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
  11: {
    text: "Super, danke für die Info. Ich habe alles notiert. Sie erhalten gleich eine SMS auf Ihr Handy — dort können Sie die erfassten Daten nochmals prüfen, bei Bedarf korrigieren und auch Fotos vom Schaden hochladen. Das hilft unserem Techniker, sich optimal vorzubereiten. Ich wünsche Ihnen alles Gute, auf Wiederhören!",
    voice: "ela",
    lang: "de",
    kind: "generic",
  },
};

// Agent turn ordering (same for Notruf and Preis).
export const TURN_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Generic line IDs (shared across Notruf/Preis and across tenants)
export const GENERIC_LINE_IDS = [2, 3, 4, 5, 6, 7, 8, 10, 11];

// Tenant-specific line IDs (need {{tenant_display_name}} rendering)
export const TENANT_LINE_IDS = [1];

// Variant-specific line IDs (Notruf vs Preis differ)
export const VARIANT_LINE_IDS = [9];

// Resolve a single turn into { text, voice, lang } given a variant (notruf|preis) and tenant name.
export function resolveAgentTurn(turnId, { variant, tenantDisplayName }) {
  const entry = AGENT_LINES[turnId];
  if (!entry) throw new Error(`no agent turn with id ${turnId}`);
  if (turnId === 9) {
    const v = entry[variant];
    if (!v) throw new Error(`variant ${variant} not in agent #9`);
    return { ...v, id: turnId, variant };
  }
  if (entry.kind === "tenant") {
    if (!tenantDisplayName) throw new Error(`tenantDisplayName required for turn ${turnId}`);
    // Connector "der"/"von" (Founder 02.06.): Firma MIT Rechtsform (AG/GmbH/…) → "der
    // Stark Haustechnik GmbH"; Personenname/Einzelfirma OHNE Rechtsform → "von Walter
    // Leuthold" (sonst grammatikalisch schief: "der Walter Leuthold").
    const legalFormRe = /\b(AG|GmbH|SA|S[àa]rl|KlG|KG|OHG|GbR|e\.?K\.?|Co\.?)\b/i;
    const hasLegalForm = legalFormRe.test(tenantDisplayName);
    const connector = hasLegalForm ? "der" : "von";
    // GESPROCHENER Name OHNE Rechtsform (02.06.): niemand sagt am Telefon „GmbH/AG", und
    // lange Namen sprengen sonst den fixen Greeting-Slot (preis 6,5s / notruf 7,0s) →
    // Build-Fail bei langen Firmen (z.B. „Schaub Haustechnik GmbH" = 7,15s). Rechtsform
    // strippen kürzt + klingt natürlicher; Connector der/von bleibt anhand der Original-Form.
    const spokenName = tenantDisplayName.replace(legalFormRe, "").replace(/\s{2,}/g, " ").trim();
    return {
      ...entry,
      text: entry.text
        .replace(/{{\s*tenant_connector\s*}}/g, connector)
        .replace(/{{\s*tenant_display_name\s*}}/g, spokenName),
      id: turnId,
    };
  }
  return { ...entry, id: turnId };
}

export function tenantFilenameToken(tenantSlug) {
  return tenantSlug.replace(/[^a-z0-9]+/g, "-");
}
