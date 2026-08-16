import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
  Heading1, Heading2, Heading3, List, ListOrdered, ListChecks,
  Quote, Link as LinkIcon, Minus,
  AlignLeft, AlignCenter, AlignRight, PenLine, Undo2, Redo2,
  Type, Code2,
} from "lucide-react";

function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      className={`tb-btn note-tool-btn ${active ? "is-active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={!!active}
      aria-label={title}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="tb-sep" aria-hidden="true" />;

export default function Toolbar({ editor, onAddText, onAddCode, onDraw }) {
  const on = !!editor; // formatting acts on the focused text block
  const chain = () => editor.chain().focus();
  const active = (name, attrs) => on && editor.isActive(name, attrs);

  const setLink = () => {
    if (!on) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL (leave blank to remove):", prev);
    if (url === null) return;
    if (url === "") return chain().extendMarkRange("link").unsetLink().run();
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    chain().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className="toolbar note-toolbar" role="toolbar" aria-label="Note tools">
      {/* Add blocks + draw — always available */}
      <div className="tb-group">
        <Btn title="Add text (or click the canvas)" onClick={onAddText}>
          <Type size={17} />
        </Btn>
        <Btn title="Add code block" onClick={onAddCode}>
          <Code2 size={17} />
        </Btn>
        <Btn title="Draw over the canvas" onClick={onDraw}>
          <PenLine size={17} />
        </Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Undo" onClick={() => chain().undo().run()} disabled={!on || !editor.can().undo()}><Undo2 size={17} /></Btn>
        <Btn title="Redo" onClick={() => chain().redo().run()} disabled={!on || !editor.can().redo()}><Redo2 size={17} /></Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Heading 1" disabled={!on} active={active("heading", { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()}><Heading1 size={18} /></Btn>
        <Btn title="Heading 2" disabled={!on} active={active("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={18} /></Btn>
        <Btn title="Heading 3" disabled={!on} active={active("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 size={18} /></Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Bold" disabled={!on} active={active("bold")} onClick={() => chain().toggleBold().run()}><Bold size={17} /></Btn>
        <Btn title="Italic" disabled={!on} active={active("italic")} onClick={() => chain().toggleItalic().run()}><Italic size={17} /></Btn>
        <Btn title="Underline" disabled={!on} active={active("underline")} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon size={17} /></Btn>
        <Btn title="Strikethrough" disabled={!on} active={active("strike")} onClick={() => chain().toggleStrike().run()}><Strikethrough size={17} /></Btn>
        <Btn title="Highlight" disabled={!on} active={active("highlight")} onClick={() => chain().toggleHighlight().run()}><Highlighter size={17} /></Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Bullet list" disabled={!on} active={active("bulletList")} onClick={() => chain().toggleBulletList().run()}><List size={17} /></Btn>
        <Btn title="Numbered list" disabled={!on} active={active("orderedList")} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={17} /></Btn>
        <Btn title="Checklist" disabled={!on} active={active("taskList")} onClick={() => chain().toggleTaskList().run()}><ListChecks size={17} /></Btn>
        <Btn title="Quote" disabled={!on} active={active("blockquote")} onClick={() => chain().toggleBlockquote().run()}><Quote size={17} /></Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Align left" disabled={!on} active={active({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}><AlignLeft size={17} /></Btn>
        <Btn title="Align center" disabled={!on} active={active({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}><AlignCenter size={17} /></Btn>
        <Btn title="Align right" disabled={!on} active={active({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}><AlignRight size={17} /></Btn>
      </div>
      <Sep />

      <div className="tb-group">
        <Btn title="Link" disabled={!on} active={active("link")} onClick={setLink}><LinkIcon size={17} /></Btn>
        <Btn title="Divider" disabled={!on} onClick={() => chain().setHorizontalRule().run()}><Minus size={17} /></Btn>
      </div>
    </div>
  );
}
