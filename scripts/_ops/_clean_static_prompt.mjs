#!/usr/bin/env node
// One-shot cleanup: remove hardcoded event/sport references from BigBen
// static prompt (Opening Hours + WHAT WE OFFER). Lisa learns about events
// only via DB-pflege through Paul (G11 — no unverified promises).
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "retell/exports/bigben-pub_agent.json";
const j = JSON.parse(readFileSync(FILE, "utf8"));
let p = j.general_prompt;
const before = p.length;

// 1. Opening Hours — drop event labels in parentheses, keep only times
p = p.replace(
  /Wednesday: 16:00–23:00 \(Quiz Night!\)/g,
  "Wednesday: 16:00–23:00",
);
p = p.replace(
  /Friday: 16:00–00:00 \(Karaoke Night!\)/g,
  "Friday: 16:00–00:00",
);
p = p.replace(
  /Saturday: 16:00–00:00 \(Live Sport \+ Live Music!\)/g,
  "Saturday: 16:00–00:00",
);
p = p.replace(/Sunday: 16:00–22:00 \(Relaxed Sunday\)/g, "Sunday: 16:00–22:00");

// 2. WHAT WE OFFER — remove specific Live Sport leagues claim and "Events:" line
p = p.replace(
  /- Live Sport on big screens: Premier League, Champions League, Rugby, F1\\n/g,
  "- Live Sport on big screens (check what's on with Paul or in the upcoming events list)\\n",
);
p = p.replace(
  /- Events: Quiz Night \(Wed\), Karaoke \(Fri\), Live Music \(Sat\)\\n/g,
  "- Events: changing programme — see the upcoming events list below for what's actually scheduled\\n",
);

// 3. NO-GO's — strengthen the no-promises rule
p = p.replace(
  "- NEVER invent events or matches that aren't in the events list",
  "- NEVER invent events, matches or theme nights that aren't in the upcoming events list. NEVER claim weekly recurrings (e.g. 'every Wednesday') unless that exact event is currently scheduled. If asked about something not in the list, say it's not currently scheduled and offer to take a callback for Paul.",
);

j.general_prompt = p;
writeFileSync(FILE, JSON.stringify(j, null, 2) + "\n");
console.log(`✓ Cleaned static prompt: ${before} → ${p.length} chars (Δ${p.length - before})`);
