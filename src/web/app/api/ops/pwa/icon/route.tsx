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
  // Responsive dot: must be clearly visible even at 32px taskbar size.
  // 48px icon (taskbar): 38% = 18px dot — unmissable
  // 96px icon (small UI): 30% = 29px dot — clear
  // 192px icon (homescreen): 15% = 29px dot — elegant
  // 512px icon (splash): 12% = 61px dot — refined
  const baseRatio =
    size <= 64 ? 0.38 : size <= 128 ? 0.30 : size <= 256 ? 0.15 : 0.12;
  const dotSize = Math.round(size * (isMaskable ? baseRatio * 0.8 : baseRatio));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a2744",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: "#c8965a",
          }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
