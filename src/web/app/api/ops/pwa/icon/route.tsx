import { ImageResponse } from "next/og";

/**
 * Dynamic PWA icon — the Signal Dot.
 * Gold circle (~12% area) centered on navy rounded square.
 * Brand system: "The dot IS the brand mark."
 *
 * ?size=192|512 (default)
 * ?maskable=1 → full-bleed for adaptive icons (no border radius)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    Math.max(parseInt(searchParams.get("size") || "512", 10), 48),
    1024
  );
  const isMaskable = searchParams.get("maskable") === "1";

  const radius = isMaskable ? 0 : Math.round(size * 0.22);
  const baseRatio =
    size <= 64 ? 0.38 : size <= 128 ? 0.30 : size <= 256 ? 0.15 : 0.12;
  const dotSize = Math.round(size * (isMaskable ? baseRatio * 0.8 : baseRatio));

  if (isMaskable) {
    // Maskable: Samsung/Android crops ~12.5% from each edge (safe zone).
    // Navy circle at 60% = thick gold ring visible after ANY crop shape.
    const innerSize = Math.round(size * 0.60);
    return new ImageResponse(
      (
        <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#c8965a" }}>
          <div style={{ width: innerSize, height: innerSize, borderRadius: "50%", backgroundColor: "#1a2744", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#c8965a" }} />
          </div>
        </div>
      ),
      { width: size, height: size },
    );
  }

  // Non-maskable: square with border (desktop, taskbar)
  const borderWidth = Math.max(Math.round(size * 0.05), 2);
  return new ImageResponse(
    (
      <div
        style={{
          width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#1a2744", borderRadius: radius,
          border: `${borderWidth}px solid #c8965a`, boxSizing: "border-box" as const,
        }}
      >
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#c8965a" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
