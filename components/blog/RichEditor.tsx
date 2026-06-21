"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, AlignRight, AlignCenter, AlignLeft,
  Link2, Image as ImageIcon, Quote, Undo, Redo,
} from "lucide-react";
import { useCallback } from "react";

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
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "כתבי את המאמר כאן..." }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 text-right",
        dir: "rtl",
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

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" dir="rtl">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive("bold"))} title="מודגש">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive("italic"))} title="נטוי">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnCls(editor.isActive("underline"))} title="קו תחתון">
          <UnderlineIcon size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnCls(editor.isActive("heading", { level: 1 }))} title="כותרת 1">
          <Heading1 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive("heading", { level: 2 }))} title="כותרת 2">
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive("heading", { level: 3 }))} title="כותרת 3">
          <Heading3 size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive("bulletList"))} title="רשימה">
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive("orderedList"))} title="רשימה ממוספרת">
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnCls(editor.isActive("blockquote"))} title="ציטוט">
          <Quote size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className={btnCls(editor.isActive({ textAlign: "right" }))} title="יישור ימין">
          <AlignRight size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className={btnCls(editor.isActive({ textAlign: "center" }))} title="מרכז">
          <AlignCenter size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className={btnCls(editor.isActive({ textAlign: "left" }))} title="יישור שמאל">
          <AlignLeft size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" onClick={addLink} className={btnCls(editor.isActive("link"))} title="קישור">
          <Link2 size={16} />
        </button>
        <button type="button" onClick={addImage} className={btnCls(false)} title="תמונה">
          <ImageIcon size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="בטל">
          <Undo size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="חזור">
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
