import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#3B1729",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C1447E" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D9A441" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5A82" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
