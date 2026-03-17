import { ImageResponse } from "next/og";

/**
 * Dynamic PWA icon — navy background + gold "L" initial + subtle gold accent dot.
 * Sizes: ?size=192 | ?size=512 (default)
 * ?maskable=1 → full-bleed version for maskable icon (no border radius, extra padding)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    Math.max(parseInt(searchParams.get("size") || "512", 10), 48),
    1024
  );
  const isMaskable = searchParams.get("maskable") === "1";

  // Maskable icons: content must fit within the inner 80% "safe zone"
  // Regular icons: rounded corners, content can use more space
  const radius = isMaskable ? 0 : Math.round(size * 0.22);
  const fontSize = Math.round(size * (isMaskable ? 0.32 : 0.40));
  const dotSize = Math.round(size * 0.07);
  const dotOffset = Math.round(size * (isMaskable ? 0.33 : 0.36));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f1d32",
          borderRadius: radius,
          position: "relative",
        }}
      >
        {/* Letter "L" */}
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: "#d4a843",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          L
        </span>
        {/* Subtle gold dot — bottom right of the letter */}
        <div
          style={{
            position: "absolute",
            right: dotOffset,
            bottom: dotOffset,
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: "#d4a843",
            opacity: 0.6,
          }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
