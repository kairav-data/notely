import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

export default function TextBlock({ content, autoFocus, onChange, onFocusEditor, onBlurEmpty, onSelect }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write something…" }),
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    onFocus: ({ editor }) => {
      onSelect?.();
      onFocusEditor(editor);
    },
    onBlur: ({ editor }) => onBlurEmpty(editor.isEmpty),
  });

  // If created via a canvas click, focus immediately.
  useEffect(() => {
    if (autoFocus && editor) editor.commands.focus("end");
  }, [autoFocus, editor]);

  return <EditorContent editor={editor} className="tblock__editor" />;
}
