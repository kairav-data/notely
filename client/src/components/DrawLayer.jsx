import { useRef, useState } from "react";
import { ShapeEl, translate, uid } from "./drawShapes.jsx";

/**
 * A transparent SVG overlay covering the note's text column.
 * When `active` (draw mode on) it captures pointer events and draws;
 * otherwise it's click-through so the text underneath stays editable,
 * while previously drawn shapes remain visible on top.
 */
export default function DrawLayer({
  active, shapes, onChange, tool, color, width, selId, setSelId,
}) {
  const svgRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null); // { x, y, value } for inline text entry
  const drag = useRef(null);

  const pt = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const commit = () => {
    const t = (editing?.value || "").trim();
    if (t && editing) {
      onChange([...shapes, { id: uid(), type: "text", x: editing.x, y: editing.y, text: t, color, size: 18 }]);
    }
    setEditing(null);
  };

  const onPointerDown = (e) => {
    if (!active) return;
    if (tool === "select") { setSelId(null); return; }

    if (tool === "text") {
      if (editing) return; // a field is already open — clicking away will commit it
      const { x, y } = pt(e);
      setEditing({ x, y: y + 8, value: "" });
      return;
    }

    svgRef.current.setPointerCapture?.(e.pointerId);
    const { x, y } = pt(e);
    const base = { id: uid(), type: tool, color, width };
    if (tool === "pen") setDraft({ ...base, points: [[x, y]] });
    else if (tool === "line" || tool === "arrow") setDraft({ ...base, x, y, x2: x, y2: y });
    else setDraft({ ...base, x, y, w: 0, h: 0 });
  };

  const onPointerMove = (e) => {
    if (drag.current) {
      const { x, y } = pt(e);
      const dx = x - drag.current.x;
      const dy = y - drag.current.y;
      onChange(shapes.map((s) => (s.id === drag.current.id ? translate(drag.current.orig, dx, dy) : s)));
      return;
    }
    if (!draft) return;
    const { x, y } = pt(e);
    if (draft.type === "pen") setDraft({ ...draft, points: [...draft.points, [x, y]] });
    else if (draft.type === "line" || draft.type === "arrow") setDraft({ ...draft, x2: x, y2: y });
    else setDraft({ ...draft, w: x - draft.x, h: y - draft.y });
  };

  const onPointerUp = () => {
    if (drag.current) { drag.current = null; return; }
    if (!draft) return;
    const tiny =
      draft.type === "pen" ? draft.points.length < 2
        : draft.type === "line" || draft.type === "arrow"
        ? Math.hypot(draft.x2 - draft.x, draft.y2 - draft.y) < 4
        : Math.abs(draft.w) < 4 && Math.abs(draft.h) < 4;
    if (!tiny) onChange([...shapes, draft]);
    setDraft(null);
  };

  const onShapePointerDown = (e, s) => {
    if (!active || tool !== "select") return;
    e.stopPropagation();
    setSelId(s.id);
    drag.current = { id: s.id, ...pt(e), orig: s };
  };

  return (
    <>
      <svg
        ref={svgRef}
        className={`draw-layer ${active ? "is-active" : ""}`}
        style={{ cursor: active ? (tool === "select" ? "default" : "crosshair") : "auto" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Transparent hit area — an empty SVG doesn't capture pointer events on
            unpainted pixels, so this rect makes the whole layer drawable. */}
        {active && (
          <rect x="0" y="0" width="100%" height="100%" fill="transparent" style={{ pointerEvents: "all" }} />
        )}
        {shapes.map((s) => (
          <ShapeEl
            key={s.id}
            s={s}
            selected={active && selId === s.id}
            onPointerDown={active && tool === "select" ? (e) => onShapePointerDown(e, s) : undefined}
          />
        ))}
        {draft && <ShapeEl s={draft} selected={false} onPointerDown={undefined} />}
      </svg>

      {/* Inline text entry — a real HTML input over the canvas (robust focus/typing). */}
      {editing && (
        <input
          ref={(el) => {
            inputRef.current = el;
            if (el) el.focus();
          }}
          className="draw-text-input"
          style={{ left: editing.x - 4, top: editing.y - 22, color, fontSize: 18 }}
          value={editing.value}
          placeholder="Type…"
          onChange={(e) => setEditing((c) => ({ ...c, value: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            else if (e.key === "Escape") { e.preventDefault(); setEditing(null); }
          }}
          onBlur={commit}
        />
      )}
    </>
  );
}
