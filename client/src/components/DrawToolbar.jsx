import { Trash2, Eraser, Check } from "lucide-react";
import { TOOLS, COLORS, WIDTHS } from "./drawShapes.jsx";

export default function DrawToolbar({
  tool, setTool, color, setColor, width, setWidth,
  onDeleteSelected, onClear, onDone, hasSelection,
}) {
  return (
    <div className="toolbar note-toolbar draw-toolbar" role="toolbar" aria-label="Drawing tools">
      <div className="tb-group">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={tool === t.id}
            className={`tb-btn note-tool-btn ${tool === t.id ? "is-active" : ""}`}
            onClick={() => setTool(t.id)}
          >
            <t.icon size={17} />
          </button>
        ))}
      </div>
      <span className="tb-sep" />

      <div className="tb-group">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            className={`draw-swatch ${color === c ? "is-active" : ""}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <span className="tb-sep" />

      <div className="tb-group">
        {WIDTHS.map((w) => (
          <button
            key={w}
            type="button"
            title={`Stroke ${w}px`}
            aria-label={`Stroke ${w} pixels`}
            aria-pressed={width === w}
            className={`tb-btn note-tool-btn ${width === w ? "is-active" : ""}`}
            onClick={() => setWidth(w)}
          >
            <span style={{ width: w + 6, height: w + 6, borderRadius: 99, background: "currentColor", display: "block" }} />
          </button>
        ))}
      </div>
      <span className="tb-sep" />

      <div className="tb-group">
        <button type="button" className="tb-btn note-tool-btn" title="Delete selected" aria-label="Delete selected"
          onClick={onDeleteSelected} disabled={!hasSelection}>
          <Trash2 size={17} />
        </button>
        <button type="button" className="tb-btn note-tool-btn" title="Clear all drawing" aria-label="Clear all drawing" onClick={onClear}>
          <Eraser size={17} />
        </button>
      </div>

      <button type="button" className="tb-btn note-tool-btn draw-done" title="Done drawing" aria-label="Done drawing" onClick={onDone}>
        <Check size={17} />
      </button>
    </div>
  );
}
