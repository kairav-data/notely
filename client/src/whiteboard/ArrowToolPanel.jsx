import {
  COLOR_PALETTE,
  STROKE_STYLES,
  ROUGHNESS_LEVELS,
  STROKE_WIDTHS,
  ARROW_TYPES,
} from "./types.js";

/**
 * ArrowToolPanel
 * Shown on the left side when the Arrow or Line tool is selected in the toolbar.
 * Lets the user configure default stroke, style, sloppiness, arrow type,
 * arrowheads, and opacity before drawing.
 */
export default function ArrowToolPanel({ currentStyle, onStyleChange }) {
  const style = currentStyle;
  const update = (patch) => onStyleChange(patch);

  return (
    <div
      className="wb-arrow-tool-panel"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* ── Stroke Color ──────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Stroke</label>
        <div className="wb-atp-color-row">
          {COLOR_PALETTE.STROKES.slice(0, 5).map((c) => (
            <button
              key={c}
              type="button"
              className={`wb-atp-swatch ${style.strokeColor === c ? "is-active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => update({ strokeColor: c })}
              title={c}
            />
          ))}
          {/* Custom color picker */}
          <input
            type="color"
            className="wb-atp-custom-color"
            value={style.strokeColor?.startsWith("#") ? style.strokeColor : "#1e1e1e"}
            onChange={(e) => update({ strokeColor: e.target.value })}
            title="Custom color"
          />
        </div>
      </div>

      {/* ── Stroke Width ──────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Stroke width</label>
        <div className="wb-atp-btn-group">
          {[
            { id: STROKE_WIDTHS.THIN,   h: 2,   label: "Thin" },
            { id: STROKE_WIDTHS.MEDIUM, h: 3.5, label: "Medium" },
            { id: STROKE_WIDTHS.BOLD,   h: 5,   label: "Bold" },
          ].map((w) => (
            <button
              key={w.id}
              type="button"
              className={`wb-atp-btn ${style.strokeWidth === w.id ? "is-active" : ""}`}
              onClick={() => update({ strokeWidth: w.id })}
              title={w.label}
            >
              <div
                style={{
                  height: w.h,
                  width: 20,
                  background: "currentColor",
                  borderRadius: 2,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Stroke Style ──────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Stroke style</label>
        <div className="wb-atp-btn-group">
          <button
            type="button"
            className={`wb-atp-btn ${style.strokeStyle === STROKE_STYLES.SOLID ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.SOLID })}
            title="Solid"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`wb-atp-btn ${style.strokeStyle === STROKE_STYLES.DASHED ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.DASHED })}
            title="Dashed"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" />
            </svg>
          </button>
          <button
            type="button"
            className={`wb-atp-btn ${style.strokeStyle === STROKE_STYLES.DOTTED ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.DOTTED })}
            title="Dotted"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sloppiness ────────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Sloppiness</label>
        <div className="wb-atp-btn-group">
          <button
            type="button"
            className={`wb-atp-btn ${style.roughness === ROUGHNESS_LEVELS.ARCHITECT ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.ARCHITECT })}
            title="Architect"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <line x1="2" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`wb-atp-btn ${style.roughness === ROUGHNESS_LEVELS.ARTIST ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.ARTIST })}
            title="Artist"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 7 C 6 3, 10 9, 14 5 C 17 2, 19 8, 20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          <button
            type="button"
            className={`wb-atp-btn ${style.roughness === ROUGHNESS_LEVELS.CARTOONIST ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.CARTOONIST })}
            title="Cartoonist"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 9 C 5 1, 9 11, 13 2 C 16 11, 18 1, 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Arrow Type ────────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Arrow type</label>
        <div className="wb-atp-btn-group">

          {/* Straight — diagonal line with open arrowhead */}
          <button
            type="button"
            className={`wb-atp-btn ${style.arrowType === ARROW_TYPES.STRAIGHT ? "is-active" : ""}`}
            onClick={() => update({ arrowType: ARROW_TYPES.STRAIGHT })}
            title="Straight"
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              <line x1="4" y1="16" x2="20" y2="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              {/* open arrowhead at top-right */}
              <polyline
                points="12,4 20,4 20,12"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          {/* Curved — smooth cubic-bezier hook */}
          <button
            type="button"
            className={`wb-atp-btn ${style.arrowType === ARROW_TYPES.CURVED ? "is-active" : ""}`}
            onClick={() => update({ arrowType: ARROW_TYPES.CURVED })}
            title="Curved"
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              {/* cubic bezier: starts bottom-left, curves to top-right */}
              <path
                d="M4 16 C4 6, 14 4, 20 4"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" fill="none"
              />
              {/* arrowhead pointing right at (20,4) */}
              <polyline
                points="14,1 20,4 14,7"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          {/* Elbow — right-angle L route */}
          <button
            type="button"
            className={`wb-atp-btn ${style.arrowType === ARROW_TYPES.ELBOW ? "is-active" : ""}`}
            onClick={() => update({ arrowType: ARROW_TYPES.ELBOW })}
            title="Elbow"
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
              {/* go right then down: start top-left → bend → end bottom-right */}
              <path
                d="M4 4 L16 4 L16 16"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
              {/* arrowhead pointing down at (16,16) */}
              <polyline
                points="12,10 16,16 20,10"
                stroke="currentColor" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

        </div>
      </div>

      {/* ── Arrowheads ────────────────────────────────── */}
      <div className="wb-atp-section">
        <label className="wb-atp-label">Arrowheads</label>

        {/* Start arrowhead row */}
        <div className="wb-atp-arrowhead-group">
          <span className="wb-atp-arrowhead-side-label">Start</span>
          <div className="wb-atp-arrowheads-row">

            {/* None */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${!style.startArrowhead ? "is-active" : ""}`}
              onClick={() => update({ startArrowhead: null })}
              title="No start arrowhead"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="4" y1="3" x2="10" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
                <line x1="10" y1="3" x2="4" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
              </svg>
            </button>

            {/* Arrow (open) */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.startArrowhead === "arrow" ? "is-active" : ""}`}
              onClick={() => update({ startArrowhead: "arrow" })}
              title="Open arrow start"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polyline points="11,3 5,7 11,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>

            {/* Triangle (filled) */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.startArrowhead === "triangle" ? "is-active" : ""}`}
              onClick={() => update({ startArrowhead: "triangle" })}
              title="Triangle start"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="10" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polygon points="10,7 16,3 16,11" fill="currentColor"/>
              </svg>
            </button>

            {/* Dot */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.startArrowhead === "dot" ? "is-active" : ""}`}
              onClick={() => update({ startArrowhead: "dot" })}
              title="Dot start"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="10" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="7" r="3.5" fill="currentColor"/>
              </svg>
            </button>

            {/* Bar */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.startArrowhead === "bar" ? "is-active" : ""}`}
              onClick={() => update({ startArrowhead: "bar" })}
              title="Bar start"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="7" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

          </div>
        </div>

        {/* End arrowhead row */}
        <div className="wb-atp-arrowhead-group">
          <span className="wb-atp-arrowhead-side-label">End</span>
          <div className="wb-atp-arrowheads-row">

            {/* None */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${!style.endArrowhead ? "is-active" : ""}`}
              onClick={() => update({ endArrowhead: null })}
              title="No end arrowhead"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="18" y1="3" x2="24" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
                <line x1="24" y1="3" x2="18" y2="11" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
              </svg>
            </button>

            {/* Arrow (open) */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.endArrowhead === "arrow" ? "is-active" : ""}`}
              onClick={() => update({ endArrowhead: "arrow" })}
              title="Open arrow end"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="22" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polyline points="17,3 23,7 17,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </button>

            {/* Triangle (filled) */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.endArrowhead === "triangle" ? "is-active" : ""}`}
              onClick={() => update({ endArrowhead: "triangle" })}
              title="Triangle end"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <polygon points="18,7 12,3 12,11" fill="currentColor"/>
              </svg>
            </button>

            {/* Dot */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.endArrowhead === "dot" ? "is-active" : ""}`}
              onClick={() => update({ endArrowhead: "dot" })}
              title="Dot end"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="21" cy="7" r="3.5" fill="currentColor"/>
              </svg>
            </button>

            {/* Bar */}
            <button
              type="button"
              className={`wb-atp-btn wb-atp-arrowhead-btn ${style.endArrowhead === "bar" ? "is-active" : ""}`}
              onClick={() => update({ endArrowhead: "bar" })}
              title="Bar end"
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                <line x1="6" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="21" y1="2" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

          </div>
        </div>
      </div>


      {/* ── Opacity ───────────────────────────────────── */}
      <div className="wb-atp-section">
        <div className="wb-atp-label-row">
          <label className="wb-atp-label">Opacity</label>
          <span className="wb-atp-value">{style.opacity ?? 100}</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={style.opacity ?? 100}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          className="wb-atp-slider"
        />
        <div className="wb-atp-slider-labels">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      {/* ── Layers ────────────────────────────────────── */}
      <div className="wb-atp-section wb-atp-layers-section">
        <label className="wb-atp-label wb-atp-label--accent">Layers</label>
      </div>
    </div>
  );
}
