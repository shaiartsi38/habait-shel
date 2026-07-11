"use client";

interface Props {
  width?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ProtectedLogo({ width = "100%", className, style }: Props) {
  return (
    <div
      className={className}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        width,
        aspectRatio: "483 / 276",
        backgroundImage: "url('/logo-habait.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        userSelect: "none",
        WebkitUserDrag: "none",
        pointerEvents: "none",
        ...style,
      } as React.CSSProperties}
    />
  );
}
