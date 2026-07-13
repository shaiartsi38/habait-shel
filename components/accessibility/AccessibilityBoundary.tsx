"use client";

import React from "react";
import { AccessibilityWidget } from "./AccessibilityWidget";

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
    if (this.state.hasError) return null;
    return <AccessibilityWidget />;
  }
}
