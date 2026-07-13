"use client";

import React from "react";
import dynamic from "next/dynamic";

// Load the widget client-side only — avoids any SSR/hydration mismatch
const Widget = dynamic(
  () =>
    import("./AccessibilityWidget").then((m) => ({
      default: m.AccessibilityWidget,
    })),
  { ssr: false, loading: () => null }
);

interface State { hasError: boolean; errorMsg: string }

export class AccessibilityBoundary extends React.Component<
  { children?: React.ReactNode },
  State
> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[A11y Widget]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 99999,
          background: "#b91c1c", color: "#fff", padding: "10px 14px",
          borderRadius: 10, fontSize: 11, maxWidth: 280, wordBreak: "break-word",
          fontFamily: "monospace", lineHeight: 1.4,
        }}>
          <strong>A11y Error:</strong> {this.state.errorMsg || "unknown"}
        </div>
      );
    }
    return <Widget />;
  }
}
