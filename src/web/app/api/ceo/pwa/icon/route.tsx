import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "512", 10), 48), 1024);
  const isMaskable = searchParams.get("maskable") === "1";
  const radius = isMaskable ? 0 : Math.round(size * 0.22);

  // CEO icon: "FS" initials on navy with gold underline accent
  const fontSize = Math.round(size * 0.32);
  const accentWidth = Math.round(size * 0.35);
  const accentHeight = Math.max(2, Math.round(size * 0.04));
  const accentTop = Math.round(size * 0.62);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a2744",
          borderRadius: radius,
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          FS
        </span>
        <div
          style={{
            position: "absolute",
            top: accentTop,
            width: accentWidth,
            height: accentHeight,
            backgroundColor: "#c8965a",
            borderRadius: accentHeight,
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
