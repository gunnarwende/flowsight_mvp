import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "512", 10), 48), 1024);
  const isMaskable = searchParams.get("maskable") === "1";
  const radius = isMaskable ? 0 : Math.round(size * 0.22);
  const borderWidth = Math.max(Math.round(size * 0.025), 1);

  // CEO icon: Gold dot on darker navy — same brand system as OPS tenant icons
  // Slightly larger dot (18%) to visually differentiate CEO from tenant icons (12%)
  const dotSize = Math.round(size * (isMaskable ? 0.14 : 0.18));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b1120",
          borderRadius: radius,
          border: `${borderWidth}px solid #c8965a`,
          boxSizing: "border-box" as const,
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
    { width: size, height: size },
  );
}
