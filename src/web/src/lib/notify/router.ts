import "server-only";

import * as Sentry from "@sentry/nextjs";
import { shouldSend } from "./throttle";
import { formatIncident } from "./templates";
import { sendWhatsApp } from "./channels/whatsapp";
import type { NotifyPayload, NotifyResult } from "./types";

/**
 * Notification router — decides which channel to use based on severity.
 *
 * Rules:
 * - RED → immediate WhatsApp (throttled: same code+ref max 1x per 15min)
 * - YELLOW → aggregated in daily summary only (no immediate send)
 * - GREEN → no notification
 *
 * Never throws. Never logs (caller owns the console.log).
 * Errors are captured to Sentry silently.
 *
 * Returns NotifyResult so callers can include wa_sent/wa_sid in their log.
 */
export async function notify(payload: NotifyPayload): Promise<NotifyResult> {
  const { severity, code, refs, tenantSlug, opsLink } = payload;

  // Only RED gets immediate WhatsApp
  if (severity !== "RED") {
    return { sent: false, channel: "none", reason: "not_red" };
  }

  // Throttle: same code + first ref within 15min → skip
  const firstRef = refs ? Object.values(refs)[0] : undefined;
  if (!shouldSend(code, firstRef)) {
    return { sent: false, channel: "whatsapp", reason: "throttled" };
  }

  // Format message — all RED alerts use incident format
  const message = formatIncident(code, tenantSlug, refs, opsLink);

  // Send (best effort)
  try {
    const result = await sendWhatsApp(message);
    return { ...result, channel: "whatsapp" };
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        _tag: "notify",
        channel: "whatsapp",
        code,
        severity,
      },
    });
    return { sent: false, channel: "whatsapp", reason: "exception" };
  }
}

// Re-export types for convenience
export type { NotifyPayload, NotifyResult, Severity } from "./types";
