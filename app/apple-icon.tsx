import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080608",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
        }}
      >
        <span
          style={{
            color: "#C4857A",
            fontSize: 110,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          נ
        </span>
      </div>
    ),
    { ...size }
  );
}
