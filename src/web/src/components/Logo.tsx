/**
 * FlowSight Logo — Signal Dot wordmark.
 *
 * Rendered as HTML (not SVG) so the dot automatically follows
 * the text regardless of font metrics or browser rendering.
 *
 * Two variants:
 *   "on-dark"  → Gold text + gold dot (for navy backgrounds)
 *   "on-light" → Navy text + gold dot (for white/light backgrounds)
 */
export function Logo({
  variant = "on-light",
  className = "",
  height = 28,
}: {
  variant?: "on-dark" | "on-light";
  className?: string;
  height?: number;
}) {
  const textClass =
    variant === "on-dark" ? "text-gold-500" : "text-navy-900";
  const fontSize = Math.round(height * 0.72);
  const dotSize = Math.max(5, Math.round(height * 0.22));

  return (
    <span
      className={`inline-flex items-end whitespace-nowrap font-semibold tracking-tight ${textClass} ${className}`}
      style={{ fontSize, lineHeight: `${height}px`, letterSpacing: "-0.5px" }}
      role="img"
      aria-label="FlowSight"
    >
      FlowSight
      <span
        className="mb-[3px] ml-[2px] inline-block shrink-0 rounded-full bg-gold-500"
        style={{ width: dotSize, height: dotSize }}
        aria-hidden="true"
      />
    </span>
  );
}

/**
 * Signal Dot only — for favicon-sized contexts or decorative use.
 */
export function SignalDot({
  size = 8,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" fill="#d4a843" />
    </svg>
  );
}
