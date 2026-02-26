/**
 * FlowSight Logo — Signal Dot wordmark.
 *
 * Two variants:
 *   "on-dark"  → Gold text + gold dot (for navy backgrounds)
 *   "on-light" → Navy text + gold dot (for white/light backgrounds)
 *
 * Uses the page's Geist font via CSS variable.
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
  const textColor = variant === "on-dark" ? "#c8965a" : "#1a2744";
  const dotColor = "#c8965a";

  // viewBox aspect ratio: 240:44 ≈ 5.45:1
  const width = Math.round(height * (240 / 44));

  return (
    <svg
      viewBox="0 0 240 44"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="FlowSight"
    >
      <text
        x="0"
        y="32"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="36"
        fontWeight="600"
        fill={textColor}
        letterSpacing="-0.5"
      >
        FlowSight
      </text>
      <circle cx="223" cy="8" r="5" fill={dotColor} />
    </svg>
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
      <circle cx="16" cy="16" r="14" fill="#c8965a" />
    </svg>
  );
}
