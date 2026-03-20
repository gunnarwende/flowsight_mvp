interface SeverityInput {
  cases: { stuck48h: number; backlogNew: number; notfallCount: number };
  trials: { followUpDue: number; zombies: number; stale: number };
  health: { ok: boolean };
  expiring24hCount: number;
}

export type Severity = "green" | "yellow" | "red";

export function computeSeverity(input: SeverityInput): Severity {
  const { cases, trials, health, expiring24hCount } = input;

  // RED conditions
  if (cases.stuck48h > 0) return "red";
  if (!health.ok) return "red";
  if (expiring24hCount > 0) return "red";
  if (trials.stale > 0) return "red";

  // YELLOW conditions
  if (cases.backlogNew > 5) return "yellow";
  if (cases.notfallCount > 0) return "yellow";
  if (trials.followUpDue > 0) return "yellow";
  if (trials.zombies > 0) return "yellow";

  return "green";
}
