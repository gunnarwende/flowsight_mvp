export type Severity = "RED" | "YELLOW" | "GREEN";

export interface NotifyPayload {
  severity: Severity;
  /** Stable machine-readable code, e.g. "CASE_CREATE_FAILED", "NOTFALL_CASE" */
  code: string;
  tenantSlug?: string;
  /** IDs only — no PII. e.g. { call_id: "abc", case_id: "def" } */
  refs?: Record<string, string>;
  /** Deep link to ops case (optional) */
  opsLink?: string;
}

export interface NotifyResult {
  sent: boolean;
  channel: string;
  messageSid?: string;
  reason?: string;
}
