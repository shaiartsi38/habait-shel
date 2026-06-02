import { ImageResponse } from "next/og";

export const size        = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <span
          style={{
            color: "#C4857A",
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          נ
        </span>
      </div>
    ),
    { ...size }
  );
}
