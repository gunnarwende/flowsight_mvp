import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(Math.max(parseInt(searchParams.get("size") || "512", 10), 48), 1024);
  const isMaskable = searchParams.get("maskable") === "1";
  const radius = isMaskable ? 0 : Math.round(size * 0.22);
  const dotSize = Math.round(size * (isMaskable ? 0.14 : 0.18));

  if (isMaskable) {
    // Maskable: Samsung/Android crops ~12.5% from each edge.
    // Navy circle at 60% = thick gold ring visible after ANY crop.
    const innerSize = Math.round(size * 0.60);
    return new ImageResponse(
      (
        <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#c8965a" }}>
          <div style={{ width: innerSize, height: innerSize, borderRadius: "50%", backgroundColor: "#0b1120", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#c8965a" }} />
          </div>
        </div>
      ),
      { width: size, height: size },
    );
  }

  // Non-maskable: square with border (desktop)
  const borderWidth = Math.max(Math.round(size * 0.05), 2);
  return new ImageResponse(
    (
      <div
        style={{
          width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: "#0b1120", borderRadius: radius,
          border: `${borderWidth}px solid #c8965a`, boxSizing: "border-box" as const,
        }}
      >
        <div style={{ width: dotSize, height: dotSize, borderRadius: "50%", backgroundColor: "#c8965a" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
