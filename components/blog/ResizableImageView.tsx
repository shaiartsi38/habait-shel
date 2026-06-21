"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState, useCallback, useEffect } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

export function ResizableImageView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const align: string = node.attrs.align ?? "center";
  const width: string | null = node.attrs.width ?? null;

  // Show toolbar when selected
  useEffect(() => {
    setShowToolbar(selected);
  }, [selected]);

  // ── Resize logic ─────────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent, corner: "se" | "sw") => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = imgRef.current?.offsetWidth ?? 300;
    setResizing(true);

    const onMove = (ev: MouseEvent) => {
      const delta = corner === "se" ? ev.clientX - startX : startX - ev.clientX;
      const newWidth = Math.max(80, Math.min(startWidth + delta, 900));
      updateAttributes({ width: `${newWidth}px` });
    };

    const onUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [updateAttributes]);

  // ── Wrapper style by alignment ────────────────────────────────
  const wrapperStyle: React.CSSProperties = (() => {
    if (align === "center") return { display: "flex", justifyContent: "center", width: "100%" };
    if (align === "right")  return { display: "flex", justifyContent: "flex-start", width: "100%" };
    if (align === "left")   return { display: "flex", justifyContent: "flex-end", width: "100%" };
    return { display: "flex", justifyContent: "center", width: "100%" };
  })();

  return (
    <NodeViewWrapper style={{ display: "block", width: "100%", margin: "0.75em 0" }}>
      <div style={wrapperStyle}>
        <div
          className="relative inline-block"
          style={{
            maxWidth: "100%",
            outline: selected ? "2px solid #3b82f6" : "2px solid transparent",
            borderRadius: 6,
            userSelect: "none",
            cursor: resizing ? "ew-resize" : "default",
          }}
        >
          {/* Image */}
          <img
            ref={imgRef}
            src={node.attrs.src}
            alt={node.attrs.alt ?? ""}
            draggable={false}
            style={{
              display: "block",
              width: width ?? "auto",
              maxWidth: "100%",
              borderRadius: 6,
            }}
          />

          {/* Floating toolbar — shows on select */}
          {showToolbar && (
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-1 z-50"
              style={{ whiteSpace: "nowrap" }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Alignment */}
              <button
                onClick={() => updateAttributes({ align: "right" })}
                className={`p-1 rounded transition-colors ${align === "right" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-600"}`}
                title="ימין"
              >
                <AlignRight size={14} />
              </button>
              <button
                onClick={() => updateAttributes({ align: "center" })}
                className={`p-1 rounded transition-colors ${align === "center" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-600"}`}
                title="מרכז"
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => updateAttributes({ align: "left" })}
                className={`p-1 rounded transition-colors ${align === "left" ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-600"}`}
                title="שמאל"
              >
                <AlignLeft size={14} />
              </button>

              <div className="w-px bg-gray-200 mx-1 h-4" />

              {/* Width input */}
              <input
                type="number"
                value={width ? parseInt(width) : ""}
                placeholder="רוחב"
                min={80}
                max={900}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v)) updateAttributes({ width: `${v}px` });
                }}
                className="w-16 text-xs border border-gray-200 rounded px-1 py-0.5 text-center text-gray-700 focus:outline-none focus:ring-1 focus:ring-rose-300"
                title="רוחב בפיקסלים"
                onMouseDown={(e) => e.stopPropagation()}
              />
              <span className="text-xs text-gray-400">px</span>

              <button
                onClick={() => updateAttributes({ width: null })}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                title="גודל מלא"
              >
                מלא
              </button>

              <div className="w-px bg-gray-200 mx-1 h-4" />

              {/* Delete */}
              <button
                onClick={deleteNode}
                className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                title="מחק תמונה"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Resize handle — bottom-right (SE) */}
          {selected && (
            <div
              onMouseDown={(e) => startResize(e, "se")}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-40"
              style={{
                background: "linear-gradient(135deg, transparent 50%, #3b82f6 50%)",
                borderBottomRightRadius: 4,
              }}
              title="גרור לשינוי גודל"
            />
          )}

          {/* Resize handle — bottom-left (SW) */}
          {selected && (
            <div
              onMouseDown={(e) => startResize(e, "sw")}
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-40"
              style={{
                background: "linear-gradient(225deg, transparent 50%, #3b82f6 50%)",
                borderBottomLeftRadius: 4,
              }}
              title="גרור לשינוי גודל"
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
