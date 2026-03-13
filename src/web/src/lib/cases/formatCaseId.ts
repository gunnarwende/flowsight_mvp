/**
 * Format a case display ID with tenant-specific prefix.
 *
 * Examples:
 *   formatCaseId(29, "WB") → "WB-0029"
 *   formatCaseId(null)      → "—"
 *   formatCaseId(3)         → "FS-0003"  (default prefix)
 */
export function formatCaseId(
  seqNumber: number | null,
  prefix: string = "FS"
): string {
  if (seqNumber === null) return "—";
  return `${prefix}-${String(seqNumber).padStart(4, "0")}`;
}
