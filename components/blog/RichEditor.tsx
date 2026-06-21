"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExt from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import { ResizableImageView } from "./ResizableImageView";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { Extension } from "@tiptap/core";
import {
  Bold, Italic, UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignRight, AlignCenter, AlignLeft,
  Link2, Image as ImageIcon, Quote, Undo, Redo, ChevronDown,
} from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";

// ── Custom FontSize extension ────────────────────────────────────
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
});

// ── Constants ────────────────────────────────────────────────────
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];
const FONT_LABELS: Record<string, string> = {
  "12px": "12", "14px": "14", "16px": "16", "18px": "18",
  "20px": "20", "24px": "24", "28px": "28", "32px": "32",
  "36px": "36", "48px": "48",
};

const FONTS = [
  { label: "ברירת מחדל", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
];

const COLORS = [
  "#000000", "#1a1a1a", "#4a4a4a", "#787878", "#aaaaaa", "#ffffff",
  "#C4857A", "#e05c5c", "#e07a3f", "#e0c13f", "#4caf50", "#2196f3",
  "#9c27b0", "#ff69b4", "#8B4513", "#2c3e50",
];

// ── Dropdown ─────────────────────────────────────────────────────
function Dropdown({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
      >
        {label}
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[130px]">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Color Swatch ─────────────────────────────────────────────────
function ColorPicker({ onChange, current }: { onChange: (c: string) => void; current?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
        title="צבע טקסט"
      >
        <span className="text-xs">A</span>
        <span
          className="w-3 h-1.5 rounded-sm border border-gray-300 block"
          style={{ background: current || "#000" }}
        />
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
          <div className="grid grid-cols-8 gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <label className="text-[10px] text-gray-400 block mb-1">צבע מותאם</label>
            <input
              type="color"
              onChange={(e) => { onChange(e.target.value); setOpen(false); }}
              className="w-full h-7 rounded cursor-pointer border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────
interface Props {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichEditor({ content, onChange, onImageUpload }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      ImageExt.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: (el) => (el as HTMLImageElement).style.width || el.getAttribute("width") || null,
              renderHTML: (attrs) => attrs.width ? { style: `width: ${attrs.width}` } : {},
            },
            align: {
              default: "center",
              parseHTML: (el) => el.getAttribute("data-align") || "center",
              renderHTML: (attrs) => ({ "data-align": attrs.align ?? "center" }),
            },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImageView);
        },
      }).configure({ inline: false, allowBase64: true }),
      LinkExt.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "כתבי את המאמר כאן..." }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] p-4 text-right text-gray-900",
        dir: "rtl",
        style: "color: #111; font-size: 16px; line-height: 1.7;",
      },
    },
  });

  const addImage = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = onImageUpload
          ? await onImageUpload(file)
          : URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert("שגיאה בהעלאת תמונה");
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = prompt("הכניסי כתובת קישור:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btnCls = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? "bg-rose-100 text-rose-600" : "hover:bg-gray-100 text-gray-600"}`;

  const currentColor = editor.getAttributes("textStyle").color as string | undefined;
  const currentFont = editor.getAttributes("textStyle").fontFamily as string | undefined;
  const currentSize = editor.getAttributes("textStyle").fontSize as string | undefined;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" dir="rtl">
      {/* ── Toolbar row 1: format ── */}
      <div className="flex flex-wrap items-center gap-1 px-2 pt-2 pb-1 border-b border-gray-100 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive("bold"))} title="מודגש"><Bold size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive("italic"))} title="נטוי"><Italic size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnCls(editor.isActive("underline"))} title="קו תחתון"><UnderlineIcon size={15} /></button>

        <div className="w-px bg-gray-200 mx-0.5 h-5" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnCls(editor.isActive("heading", { level: 1 }))} title="כותרת 1"><Heading1 size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive("heading", { level: 2 }))} title="כותרת 2"><Heading2 size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive("heading", { level: 3 }))} title="כותרת 3"><Heading3 size={15} /></button>

        <div className="w-px bg-gray-200 mx-0.5 h-5" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive("bulletList"))} title="רשימה"><List size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive("orderedList"))} title="רשימה ממוספרת"><ListOrdered size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnCls(editor.isActive("blockquote"))} title="ציטוט"><Quote size={15} /></button>

        <div className="w-px bg-gray-200 mx-0.5 h-5" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnCls(editor.isActive({ textAlign: "right" }))} title="ימין"><AlignRight size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnCls(editor.isActive({ textAlign: "center" }))} title="מרכז"><AlignCenter size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnCls(editor.isActive({ textAlign: "left" }))} title="שמאל"><AlignLeft size={15} /></button>

        <div className="w-px bg-gray-200 mx-0.5 h-5" />

        <button type="button" onClick={addLink} className={btnCls(editor.isActive("link"))} title="קישור"><Link2 size={15} /></button>
        <button type="button" onClick={addImage} className={btnCls(false)} title="תמונה"><ImageIcon size={15} /></button>

        <div className="w-px bg-gray-200 mx-0.5 h-5" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="בטל"><Undo size={15} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="חזור"><Redo size={15} /></button>
      </div>

      {/* ── Toolbar row 2: font, size, color ── */}
      <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Font family */}
        <Dropdown label={<span className="text-xs">{FONTS.find(f => f.value === currentFont)?.label ?? "גופן"}</span>}>
          {FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                if (f.value) editor.chain().focus().setFontFamily(f.value).run();
                else editor.chain().focus().unsetFontFamily().run();
              }}
              className={`w-full text-right px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${currentFont === f.value ? "text-rose-600 font-medium" : "text-gray-700"}`}
              style={{ fontFamily: f.value || "inherit" }}
            >
              {f.label}
            </button>
          ))}
        </Dropdown>

        {/* Font size */}
        <Dropdown label={<span className="text-xs w-6 text-center">{currentSize ? currentSize.replace("px", "") : "גודל"}</span>}>
          {FONT_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => editor!.chain().focus().setMark("textStyle", { fontSize: s }).run()}
              className={`w-full text-right px-3 py-1 text-sm hover:bg-gray-50 transition-colors ${currentSize === s ? "text-rose-600 font-medium" : "text-gray-700"}`}
            >
              {FONT_LABELS[s]}
            </button>
          ))}
        </Dropdown>

        {/* Color */}
        <ColorPicker
          current={currentColor}
          onChange={(c) => editor.chain().focus().setColor(c).run()}
        />
      </div>

      {/* ── Editor area ── */}
      <div style={{ background: "#fff" }}>
        <style>{`
          .tiptap-editor p { color: #111; margin: 0.5em 0; }
          .tiptap-editor h1 { color: #111; font-size: 2em; font-weight: bold; margin: 0.5em 0; }
          .tiptap-editor h2 { color: #111; font-size: 1.5em; font-weight: bold; margin: 0.5em 0; }
          .tiptap-editor h3 { color: #111; font-size: 1.25em; font-weight: bold; margin: 0.5em 0; }
          .tiptap-editor ul { list-style: disc; padding-right: 1.5em; }
          .tiptap-editor ol { list-style: decimal; padding-right: 1.5em; }
          .tiptap-editor blockquote { border-right: 3px solid #C4857A; padding-right: 1em; color: #555; margin: 1em 0; }
          .tiptap-editor a { color: #C4857A; text-decoration: underline; }
          .tiptap-editor img { max-width: 100%; border-radius: 12px; margin: 0.5em 0; }
          .tiptap-editor .is-editor-empty:first-child::before { color: #aaa; content: attr(data-placeholder); float: right; height: 0; pointer-events: none; }
        `}</style>
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
