// Morning Report — pure rendering layer (no I/O).
//
// Takes a plain data model (gathered in morning_report.mjs) and returns
// { subject, text, html }. Kept side-effect-free so it can be rendered with
// fixtures (no Supabase) — see morning_report_render.fixture.mjs.
//
// Aligned to the Customer Journey (Schwungkreis, Phase Sales) and the
// CANONICAL outreach cadence (docs/gtm/outreach_templates.md, Modell 04.06.):
//   Tag 0 Mail → Tag 3 Reminder → Tag 6-7 Anruf → Pause (max 3 Touches)
//   → Tag 14 Ablauf → parken (Re-Outreach ~3 Mte).
//
// Reliable signal ONLY: opened? (view_count), age since send (created_at),
// recency (last_viewed_at). Per-take watch-% is deliberately OMITTED until
// MR2 (clean tracking): T1 is one shared canonical video → its % is meaningless,
// and the rest is polluted by the founder's own views.

const DAY = 86400000;

const PALETTE = {
  bg: "#0f172a",
  card: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  gold: "#d4a853",
  green: "#34d399",
  yellow: "#fbbf24",
  red: "#f87171",
};

// ── Lead classification (canonical cadence) ─────────────────────────────────
export function classifyLead(page, now = Date.now()) {
  const created = page.created_at ? new Date(page.created_at).getTime() : now;
  const ageD = Math.max(0, Math.floor((now - created) / DAY));
  const views = page.view_count ?? 0;
  const opened = views > 0;
  const name = page.company_name || page.tenant_slug || "—";
  // Ehrliche Watch-Tiefe der Anruf-Demo T2 (MR2). null = noch kein sauberes Signal.
  const t2Pct = Number.isFinite(page.t2_pct) ? page.t2_pct : null;
  const deepT2 = t2Pct != null && t2Pct >= 60;

  let prio, emoji, action;
  if (opened && deepT2) {
    prio = 6; emoji = "🔥🔥"; action = `ANRUFEN — hat die Anruf-Demo (T2) zu ${t2Pct}% gesehen — heißestes Signal`;
  } else if (opened && ageD >= 1) {
    prio = 5; emoji = "🔥"; action = 'ANRUFEN (warm) — „Was war Ihr erster Eindruck?"';
  } else if (opened) {
    prio = 4; emoji = "👀"; action = "heute geöffnet — heute/morgen anrufen";
  } else if (ageD >= 14) {
    prio = 2; emoji = "💤"; action = "abgelaufen — parken, Re-Outreach ~3 Mte";
  } else if (ageD >= 6) {
    prio = 5; emoji = "📞"; action = "Tag-6-7-Anruf fällig (kalt, persönlich)";
  } else if (ageD >= 3) {
    prio = 3; emoji = "👋"; action = 'Tag-3-Reminder — „falls untergegangen, hier nochmal"';
  } else {
    prio = 1; emoji = "🌱"; action = "frisch versendet — abwarten";
  }

  return {
    name, ageD, opened, views, t2Pct,
    lastViewedAt: page.last_viewed_at || null,
    token: page.token || null,
    prio, emoji, action,
  };
}

function relAge(ageD) {
  return ageD === 0 ? "heute" : ageD === 1 ? "gestern" : `vor ${ageD} Tagen`;
}

function leadMeta(l) {
  const opened = l.opened
    ? `geöffnet ${l.views}×${l.lastViewedAt ? ` (zuletzt ${relAge(Math.max(0, Math.floor((Date.now() - new Date(l.lastViewedAt).getTime()) / DAY)))})` : ""}`
    : "noch nicht geöffnet";
  const depth = l.t2Pct != null ? ` · T2 ${l.t2Pct}% gesehen` : "";
  return `Tag ${l.ageD} · ${opened}${depth}`;
}

// ── Severity + reason (traceable color) ─────────────────────────────────────
export function computeSeverity(m) {
  const redDrivers = [];
  if ((m.alerts?.notfall ?? 0) > 0) redDrivers.push(`${m.alerts.notfall} Notfall-Meldung`);
  if ((m.alerts?.agentHangup ?? 0) > 0) redDrivers.push(`Telefon-Assistentin hat aufgelegt (${m.alerts.agentHangup}×)`);
  if ((m.alerts?.stuck48h ?? 0) > 0) redDrivers.push(`${m.alerts.stuck48h} Fall/Fälle >48h hängend`);
  if ((m.alerts?.expiring24h ?? 0) > 0) redDrivers.push(`${m.alerts.expiring24h} Test-Zugang läuft <24h aus`);
  if (!m.system?.ok) redDrivers.push("System-Check (E-Mail/DB/API)");

  const dueLeads = (m.leads ?? []).filter((l) => l.prio >= 3);
  const yellowDrivers = [];
  if (dueLeads.length > 0) yellowDrivers.push(`${dueLeads.length} Lead${dueLeads.length === 1 ? "" : "s"} fällig`);
  if ((m.overview?.followUpDue ?? 0) > 0) yellowDrivers.push(`${m.overview.followUpDue}× Trial-Follow-up`);
  if ((m.customerHealth?.bigbenPendingStale ?? 0) > 0) yellowDrivers.push(`${m.customerHealth.bigbenPendingStale} BigBen-Reservierung(en) >6h (FYI)`);

  const symbol = redDrivers.length ? "🔴" : yellowDrivers.length ? "🟡" : "🟢";
  const drivers = redDrivers.length ? redDrivers : yellowDrivers;
  const points = redDrivers.length + dueLeads.length + (yellowDrivers.length && !dueLeads.length ? yellowDrivers.length : 0);
  return { symbol, redDrivers, yellowDrivers, drivers, dueLeads, points };
}

// ── Plaintext (logs + email text fallback) ──────────────────────────────────
export function renderText(m) {
  const sev = computeSeverity(m);
  const leads = [...(m.leads ?? [])].sort((a, b) => b.prio - a.prio || a.ageD - b.ageD);
  const due = leads.filter((l) => l.prio >= 3);
  const rest = leads.filter((l) => l.prio < 3);

  const lines = [];
  lines.push(`${sev.symbol}  FlowSight · Tagesüberblick · ${m.dateStr}`);
  if (sev.drivers.length) lines.push(`   (${sev.symbol === "🔴" ? "rot" : "gelb"} wegen: ${sev.drivers.join(" · ")})`);
  lines.push("");

  lines.push("🎯 HEUTE DRAN — deine Leads");
  if (due.length) {
    for (const l of due) lines.push(`   ${l.emoji} ${l.name} — ${leadMeta(l)}  →  ${l.action}`);
  } else {
    lines.push("   • Nichts fällig — alles ruhig.");
  }
  lines.push("");

  if (rest.length) {
    lines.push("📋 BOARD (übrige Beweis-Seiten)");
    for (const l of rest) lines.push(`   ${l.emoji} ${l.name} — ${leadMeta(l)}  →  ${l.action}`);
    lines.push("");
  }

  lines.push("📥 BETRIEB & SYSTEM");
  const o = m.overview ?? {};
  lines.push(`   Anfragen 24h: ${o.cases24h ?? 0} · Offen: ${o.backlogNew ?? 0} · Erledigt 7T: ${o.done7d ?? 0}`);
  lines.push(`   Test-Zugänge: ${o.activeTrials ?? 0} · Follow-up fällig: ${o.followUpDue ?? 0}`);
  if ((m.customerHealth?.bigbenPendingStale ?? 0) > 0) {
    lines.push(`   Kunde BigBen: ${m.customerHealth.bigbenPendingStale} Reservierung(en) >6h unbestätigt (FYI — nicht deine To-Do)`);
  }
  lines.push(`   System: ${m.system?.ok ? "alles ok ✓" : `bitte prüfen — ${(m.system?.problems ?? ["E-Mail/DB/API"]).join(", ")}`}`);
  lines.push("");
  lines.push(`→ Zum Leitsystem: ${m.appUrl}/ops`);

  return lines.join("\n");
}

// ── Responsive mobile-first HTML email ──────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function leadCardHtml(l, appUrl) {
  const link = l.token ? `${appUrl}/p/${l.token}` : null;
  const meta = esc(leadMeta(l));
  const action = esc(l.action);
  const cta = link
    ? `<a href="${link}" style="color:${PALETTE.gold};text-decoration:none;font-weight:600">Seite öffnen →</a>`
    : "";
  return `
    <tr><td style="padding:10px 0;border-bottom:1px solid #334155">
      <div style="font-size:17px;font-weight:600;color:${PALETTE.text}">${l.emoji} ${esc(l.name)}</div>
      <div style="font-size:14px;color:${PALETTE.muted};margin:2px 0 4px">${meta}</div>
      <div style="font-size:15px;color:${PALETTE.text}">→ ${action}</div>
      ${cta ? `<div style="margin-top:6px;font-size:15px">${cta}</div>` : ""}
    </td></tr>`;
}

export function renderHtml(m) {
  const sev = computeSeverity(m);
  const accent = sev.symbol === "🔴" ? PALETTE.red : sev.symbol === "🟡" ? PALETTE.yellow : PALETTE.green;
  const leads = [...(m.leads ?? [])].sort((a, b) => b.prio - a.prio || a.ageD - b.ageD);
  const due = leads.filter((l) => l.prio >= 3);
  const rest = leads.filter((l) => l.prio < 3);
  const o = m.overview ?? {};

  const section = (title, innerRows) => `
    <div style="background:${PALETTE.card};border-radius:10px;padding:16px;margin:0 0 14px">
      <div style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${PALETTE.gold};font-weight:700;margin-bottom:8px">${title}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${innerRows}</table>
    </div>`;

  const dueRows = due.length
    ? due.map((l) => leadCardHtml(l, m.appUrl)).join("")
    : `<tr><td style="font-size:15px;color:${PALETTE.muted}">Nichts fällig — alles ruhig.</td></tr>`;

  const restSection = rest.length
    ? section("📋 Board · übrige Beweis-Seiten", rest.map((l) => leadCardHtml(l, m.appUrl)).join(""))
    : "";

  const bigben = (m.customerHealth?.bigbenPendingStale ?? 0) > 0
    ? `<tr><td style="padding:4px 0;font-size:14px;color:${PALETTE.muted}">Kunde BigBen: ${m.customerHealth.bigbenPendingStale} Reservierung(en) &gt;6h unbestätigt <span style="color:#64748b">(FYI — nicht deine To-Do)</span></td></tr>`
    : "";

  const systemRow = m.system?.ok
    ? `<tr><td style="padding:4px 0;font-size:14px;color:${PALETTE.green}">System: alles ok ✓</td></tr>`
    : `<tr><td style="padding:4px 0;font-size:14px;color:${PALETTE.red}">System: bitte prüfen — ${esc((m.system?.problems ?? ["E-Mail/DB/API"]).join(", "))}</td></tr>`;

  const overviewSection = section("📥 Betrieb &amp; System", `
    <tr><td style="padding:4px 0;font-size:15px;color:${PALETTE.text}">Anfragen 24h: <b>${o.cases24h ?? 0}</b> · Offen: <b>${o.backlogNew ?? 0}</b> · Erledigt 7T: <b>${o.done7d ?? 0}</b></td></tr>
    <tr><td style="padding:4px 0;font-size:15px;color:${PALETTE.text}">Test-Zugänge: <b>${o.activeTrials ?? 0}</b> · Follow-up fällig: <b>${o.followUpDue ?? 0}</b></td></tr>
    ${bigben}${systemRow}`);

  const reason = sev.drivers.length
    ? `<div style="font-size:14px;color:${PALETTE.muted};margin-top:4px">${sev.symbol === "🔴" ? "rot" : "gelb"} wegen: ${esc(sev.drivers.join(" · "))}</div>`
    : `<div style="font-size:14px;color:${PALETTE.green};margin-top:4px">alles ruhig</div>`;

  return `<!doctype html><html><body style="margin:0;padding:0;background:${PALETTE.bg}">
  <div style="max-width:600px;margin:0 auto;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
    <div style="height:4px;background:${accent};border-radius:2px;margin-bottom:14px"></div>
    <div style="font-size:21px;font-weight:700;color:${PALETTE.text}">${sev.symbol} FlowSight · Tagesüberblick</div>
    <div style="font-size:14px;color:${PALETTE.muted}">${esc(m.dateStr)}</div>
    ${reason}
    <div style="height:16px"></div>
    ${section("🎯 Heute dran · deine Leads", dueRows)}
    ${restSection}
    ${overviewSection}
    <a href="${m.appUrl}/ops" style="display:inline-block;background:${PALETTE.gold};color:#0b1120;text-decoration:none;font-weight:700;font-size:16px;padding:12px 20px;border-radius:8px;margin-top:4px">→ Zum Leitsystem</a>
  </div></body></html>`;
}

export function render(m) {
  const sev = computeSeverity(m);
  const fazit = sev.points > 0 ? `${sev.points} ${sev.points === 1 ? "Punkt" : "Punkte"} für dich` : "alles ruhig";
  const subject = `${sev.symbol} FlowSight · ${m.dateStr} · ${fazit}`;
  return { subject, text: renderText(m), html: renderHtml(m) };
}
