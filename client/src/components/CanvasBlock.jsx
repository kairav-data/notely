import { useRef } from "react";
import { GripVertical } from "lucide-react";
import TextBlock from "./TextBlock.jsx";
import CodeBox from "./CodeBox.jsx";

/**
 * A positioned, draggable, width-resizable container placed freely on the
 * canvas. Holds either a text block or a code block.
 */
export default function CanvasBlock({
  block, active, onPatch, onDelete, onSelect, onFocusEditor, onBlurEmpty,
}) {
  const drag = useRef(null);
  const resize = useRef(null);

  const onHandleDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: block.x, y: block.y };
  };
  const onHandleMove = (e) => {
    if (!drag.current) return;
    const nx = drag.current.x + (e.clientX - drag.current.px);
    const ny = drag.current.y + (e.clientY - drag.current.py);
    onPatch({ x: Math.max(0, nx), y: Math.max(0, ny) });
  };
  const onHandleUp = (e) => {
    if (drag.current) {
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* pointer was already cancelled */ }
      drag.current = null;
    }
  };

  const onResizeDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    e.currentTarget.setPointerCapture(e.pointerId);
    resize.current = { px: e.clientX, w: block.width };
  };
  const onResizeMove = (e) => {
    if (!resize.current) return;
    onPatch({ width: Math.max(200, resize.current.w + (e.clientX - resize.current.px)) });
  };
  const onResizeUp = (e) => {
    if (resize.current) {
      try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* pointer was already cancelled */ }
      resize.current = null;
    }
  };

  return (
    <div
      className={`cblock ${active ? "is-active" : ""} cblock--${block.kind}`}
      style={{ left: block.x, top: block.y, width: block.width, zIndex: block.z || 1 }}
      onPointerDown={(e) => {
        // Let a tap inside an editor reach the native contenteditable element
        // first. Selecting the block before that happens can prevent the
        // mobile keyboard from opening reliably.
        if (e.target.closest?.(".tblock__editor, .codebox")) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="cblock__handle"
        title="Drag to move"
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
        onPointerCancel={onHandleUp}
      >
        <GripVertical size={11} />
      </div>

      <div className="cblock__body">
        {block.kind === "code" ? (
          <CodeBox
            code={block.code || ""}
            language={block.language || "python"}
            onChange={(patch) => onPatch(patch)}
            onFocus={() => { onSelect(); onFocusEditor(null); }}
          />
        ) : (
          <TextBlock
            content={block.content}
            autoFocus={block.autoFocus}
            onChange={(content) => onPatch({ content })}
            onSelect={onSelect}
            onFocusEditor={onFocusEditor}
            onBlurEmpty={onBlurEmpty}
          />
        )}
      </div>

      <div
        className="cblock__resize"
        title="Drag to resize width"
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
        onPointerCancel={onResizeUp}
      />
    </div>
  );
}
