/**
 * Message templates for WhatsApp notifications.
 * No PII — only IDs (truncated to 8 chars), codes, and links.
 */

function truncId(id: string): string {
  return id.slice(0, 8);
}

function formatRefs(refs?: Record<string, string>): string {
  if (!refs || Object.keys(refs).length === 0) return "";
  return Object.entries(refs)
    .map(([k, v]) => `${k}:${truncId(v)}`)
    .join(" ");
}

/**
 * RED Incident — system failure (case create, email dispatch, webhook invalid)
 * Format: 🔴 INCIDENT <code> | tenant:<slug> | refs | → link
 */
export function formatIncident(
  code: string,
  tenantSlug?: string,
  refs?: Record<string, string>,
  opsLink?: string,
): string {
  const parts = [`🔴 INCIDENT ${code}`];
  if (tenantSlug) parts.push(`tenant:${tenantSlug}`);
  const r = formatRefs(refs);
  if (r) parts.push(r);
  if (opsLink) parts.push(`→ ${opsLink}`);
  return parts.join(" | ");
}

/**
 * DAILY Summary
 * Format: 📊 DAILY DD.MM | 🔴red:<n> 🟡yellow:<n> | top:<codes> | → link
 */
export function formatDaily(
  date: string,
  red: number,
  yellow: number,
  topCodes: string[],
  opsLink?: string,
): string {
  const parts = [`📊 DAILY ${date}`];
  parts.push(`🔴${red} 🟡${yellow}`);
  if (topCodes.length > 0) parts.push(`top:${topCodes.join(",")}`);
  if (opsLink) parts.push(`→ ${opsLink}`);
  return parts.join(" | ");
}
