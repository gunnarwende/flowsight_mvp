import { ImageResponse } from "next/og";

/**
 * Dynamic PWA icon — navy background + gold circle.
 * Sizes: ?size=192 | ?size=512 (default)
 * Used by manifest.json and apple-touch-icon.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    Math.max(parseInt(searchParams.get("size") || "512", 10), 48),
    1024
  );
  const radius = Math.round(size * 0.22);
  const circleSize = Math.round(size * 0.44);

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
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            backgroundColor: "#d4a843",
          }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
