// Parse notruf.txt / preis.txt into structured turns.
// Format convention (from Final_generic_scripting.txt):
//   Turn lines are either "Lisa: ..." or "Kunde: ..." (or other markers).
// We split on case-insensitive "Lisa:" / "Kunde:" prefixes and collect sequential turns.
import fs from "node:fs";

// Robust parser: accepts variations like "Lisa (DE):", "Lisa (EN)", "Caller:", "User:", "Kunde:".
export function parseCallScript(file) {
  const raw = fs.readFileSync(file, "utf8");
  const lines = raw.split(/\r?\n/);
  const turns = [];
  let cur = null;
  const re = /^\s*(Lisa(?:\s*\((DE|EN|FR|IT|de|en|fr|it)\))?|Agent|Kunde|Caller|User|Anrufer|Gunnar|Founder)\s*:\s*(.*)$/;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      if (cur) turns.push(cur);
      const who = m[1].toLowerCase();
      const lang = m[2] ? m[2].toLowerCase() : undefined;
      const role = who.startsWith("lisa") || who === "agent" ? "agent" : "user";
      cur = { role, speaker: who, lang, text: m[3].trim() };
    } else if (cur && line.trim()) {
      cur.text += " " + line.trim();
    }
  }
  if (cur) turns.push(cur);
  return turns.filter((t) => t.text && t.text.length > 0);
}

// Split turns into agent-only (Lisa) array with turn-number, detecting language switches.
export function agentTurns(turns) {
  return turns
    .map((t, idx) => ({ ...t, index: idx }))
    .filter((t) => t.role === "agent");
}

export function userTurns(turns) {
  return turns
    .map((t, idx) => ({ ...t, index: idx }))
    .filter((t) => t.role === "user");
}
