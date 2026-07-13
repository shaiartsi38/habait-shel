"use client";

import React from "react";
import dynamic from "next/dynamic";

const AccessibilityWidget = dynamic(
  () => import("./AccessibilityWidget").then(m => ({ default: m.AccessibilityWidget })),
  { ssr: false, loading: () => null }
);

interface State { hasError: boolean }

export class AccessibilityBoundary extends React.Component<
  { children?: React.ReactNode },
  State
> {
  constructor(props: { children?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[A11y Widget]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) return null;
    return <AccessibilityWidget />;
  }
}
