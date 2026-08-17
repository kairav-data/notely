import {
  COLOR_PALETTE,
  FILL_STYLES,
  STROKE_STYLES,
  ROUGHNESS_LEVELS,
  STROKE_WIDTHS,
  FONT_FAMILIES,
  FONT_SIZES,
  CODE_LANGUAGES,
} from "./types.js";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Signature,
  Type,
  BookOpenText,
  Code2,
} from "lucide-react";

export default function StylePanel({
  selectedElements = [],
  currentStyle,
  onStyleChange,
  onLayerChange,
  onAlignChange,
  onDuplicate,
  onDelete,
  onToggleLock,
  isToolDefaults = false,
}) {
  if ((!selectedElements || selectedElements.length === 0) && !isToolDefaults) {
    return null;
  }

  const panelElements = isToolDefaults ? [{ type: "text", ...currentStyle }] : selectedElements;
  const isMulti = panelElements.length > 1;
  const isSingle = panelElements.length === 1;
  const isAllLocked = panelElements.every((el) => el.locked);

  const activeTypes = new Set(panelElements.map((el) => el.type));
  const hasShape = activeTypes.has("rectangle") || activeTypes.has("diamond") || activeTypes.has("ellipse");
  const hasLineOrArrow = activeTypes.has("line") || activeTypes.has("arrow");
  const hasText = activeTypes.has("text");
  const isTextOnly = hasText && activeTypes.size === 1;

  const style = isSingle ? { ...currentStyle, ...selectedElements[0] } : currentStyle;

  const update = (patch) => {
    onStyleChange(patch);
  };

  return (
    <div
      className={`wb-style-panel ${isTextOnly ? "wb-style-panel--text" : ""}`}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Stroke Color */}
      <div className="wb-style-section">
        <label className="wb-style-label">Stroke</label>
        <div className="wb-color-row">
          {COLOR_PALETTE.STROKES.map((c) => (
            <button
              key={c}
              type="button"
              className={`wb-color-swatch ${style.strokeColor === c ? "is-active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => update({ strokeColor: c })}
              title={c}
            />
          ))}
          <input
            type="color"
            className="wb-color-picker"
            value={style.strokeColor?.startsWith("#") ? style.strokeColor : "#1e1e1e"}
            onChange={(e) => update({ strokeColor: e.target.value })}
            title="Custom stroke color"
          />
        </div>
      </div>

      {/* Background / Fill Color */}
      {(hasShape || hasLineOrArrow) && (
        <div className="wb-style-section">
          <label className="wb-style-label">Background</label>
          <div className="wb-color-row">
            {COLOR_PALETTE.BACKGROUNDS.map((c) => (
              <button
                key={c}
                type="button"
                className={`wb-color-swatch ${style.backgroundColor === c ? "is-active" : ""} ${c === "transparent" ? "is-transparent" : ""}`}
                style={{ backgroundColor: c === "transparent" ? "#ffffff" : c }}
                onClick={() => update({ backgroundColor: c })}
                title={c === "transparent" ? "Transparent" : c}
              >
                {c === "transparent" && <div className="wb-transparent-line" />}
              </button>
            ))}
            <input
              type="color"
              className="wb-color-picker"
              value={style.backgroundColor?.startsWith("#") ? style.backgroundColor : "#ffffff"}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              title="Custom background color"
            />
          </div>
        </div>
      )}

      {/* Fill Style — always shown for shapes so user can pick before picking a color */}
      {hasShape && (
        <div className="wb-style-section">
          <label className="wb-style-label">Fill</label>
          <div className="wb-btn-group">
            {/* None / Transparent */}
            <button
              type="button"
              className={`wb-btn-option ${style.backgroundColor === "transparent" ? "is-active" : ""}`}
              onClick={() => update({ backgroundColor: "transparent" })}
              title="No fill"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3" y1="17" x2="17" y2="3" stroke="#e03131" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Hachure */}
            <button
              type="button"
              className={`wb-btn-option ${style.backgroundColor !== "transparent" && style.fillStyle === FILL_STYLES.HACHURE ? "is-active" : ""}`}
              onClick={() => update({
                fillStyle: FILL_STYLES.HACHURE,
                backgroundColor: style.backgroundColor === "transparent" ? "#ffc9c9" : style.backgroundColor,
              })}
              title="Hachure"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="10" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="10" y1="16" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Cross-hatch */}
            <button
              type="button"
              className={`wb-btn-option ${style.backgroundColor !== "transparent" && style.fillStyle === FILL_STYLES.CROSS_HATCH ? "is-active" : ""}`}
              onClick={() => update({
                fillStyle: FILL_STYLES.CROSS_HATCH,
                backgroundColor: style.backgroundColor === "transparent" ? "#ffc9c9" : style.backgroundColor,
              })}
              title="Cross-hatch"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {/* Solid */}
            <button
              type="button"
              className={`wb-btn-option ${style.backgroundColor !== "transparent" && style.fillStyle === FILL_STYLES.SOLID ? "is-active" : ""}`}
              onClick={() => update({
                fillStyle: FILL_STYLES.SOLID,
                backgroundColor: style.backgroundColor === "transparent" ? "#ffc9c9" : style.backgroundColor,
              })}
              title="Solid"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="2" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}


      {/* Stroke Width */}
      <div className="wb-style-section wb-text-inapplicable">
        <label className="wb-style-label">Stroke width</label>
        <div className="wb-btn-group">
          {[
            { id: STROKE_WIDTHS.THIN, label: "Thin", h: 2 },
            { id: STROKE_WIDTHS.MEDIUM, label: "Medium", h: 3.5 },
            { id: STROKE_WIDTHS.BOLD, label: "Bold", h: 5 },
            { id: STROKE_WIDTHS.EXTRA, label: "Extra", h: 7 },
          ].map((w) => (
            <button
              key={w.id}
              type="button"
              className={`wb-btn-option ${style.strokeWidth === w.id ? "is-active" : ""}`}
              onClick={() => update({ strokeWidth: w.id })}
              title={w.label}
            >
              <div style={{ height: w.h, width: 18, background: "currentColor", borderRadius: 2 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style */}
      <div className="wb-style-section wb-text-inapplicable">
        <label className="wb-style-label">Stroke style</label>
        <div className="wb-btn-group">
          <button
            type="button"
            className={`wb-btn-option ${style.strokeStyle === STROKE_STYLES.SOLID ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.SOLID })}
            title="Solid"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={`wb-btn-option ${style.strokeStyle === STROKE_STYLES.DASHED ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.DASHED })}
            title="Dashed"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" />
            </svg>
          </button>
          <button
            type="button"
            className={`wb-btn-option ${style.strokeStyle === STROKE_STYLES.DOTTED ? "is-active" : ""}`}
            onClick={() => update({ strokeStyle: STROKE_STYLES.DOTTED })}
            title="Dotted"
          >
            <svg width="22" height="6" viewBox="0 0 22 6">
              <line x1="1" y1="3" x2="21" y2="3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sloppiness */}
      <div className="wb-style-section wb-text-inapplicable">
        <label className="wb-style-label">Sloppiness</label>
        <div className="wb-btn-group">
          {/* Architect (Clean straight) */}
          <button
            type="button"
            className={`wb-btn-option ${style.roughness === ROUGHNESS_LEVELS.ARCHITECT ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.ARCHITECT })}
            title="Architect"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <line x1="2" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Artist (Gentle wave) */}
          <button
            type="button"
            className={`wb-btn-option ${style.roughness === ROUGHNESS_LEVELS.ARTIST ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.ARTIST })}
            title="Artist"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 7 C 6 3, 10 9, 14 5 C 17 2, 19 8, 20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Cartoonist (Wild curve) */}
          <button
            type="button"
            className={`wb-btn-option ${style.roughness === ROUGHNESS_LEVELS.CARTOONIST ? "is-active" : ""}`}
            onClick={() => update({ roughness: ROUGHNESS_LEVELS.CARTOONIST })}
            title="Cartoonist"
          >
            <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
              <path d="M2 9 C 5 1, 9 11, 13 2 C 16 11, 18 1, 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Edges (Sharp vs Round) */}
      {hasShape && (
        <div className="wb-style-section">
          <label className="wb-style-label">Edges</label>
          <div className="wb-btn-group">
            {/* Sharp */}
            <button
              type="button"
              className={`wb-btn-option ${!style.roundness ? "is-active" : ""}`}
              onClick={() => update({ roundness: false })}
              title="Sharp edges"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="0" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            </button>

            {/* Round */}
            <button
              type="button"
              className={`wb-btn-option ${style.roundness ? "is-active" : ""}`}
              onClick={() => update({ roundness: true })}
              title="Round edges"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="3" width="14" height="14" rx="5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Arrowhead Styles */}
      {hasLineOrArrow && (
        <div className="wb-style-section">
          <label className="wb-style-label">Arrowhead</label>
          <div className="wb-btn-group">
            {[
              { id: null, label: "None" },
              { id: "arrow", label: "Arrow" },
              { id: "triangle", label: "Triangle" },
              { id: "dot", label: "Dot" },
              { id: "bar", label: "Bar" },
            ].map((head) => (
              <button
                key={head.label}
                type="button"
                className={`wb-btn-option ${style.endArrowhead === head.id ? "is-active" : ""}`}
                onClick={() => update({ endArrowhead: head.id })}
                title={head.label}
              >
                {head.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Typography Controls (Text elements) */}
      {hasText && (
        <>
          <div className="wb-style-section">
            <label className="wb-style-label">Font family</label>
            <div className="wb-btn-group">
              {[
                { id: FONT_FAMILIES.HAND_DRAWN, label: "Hand-drawn", icon: Signature },
                { id: FONT_FAMILIES.NORMAL, label: "Sans-serif", icon: Type },
                { id: FONT_FAMILIES.SERIF, label: "Serif", icon: BookOpenText },
                { id: FONT_FAMILIES.CODE, label: "Code", icon: Code2 },
              ].map((f) => {
                const Icon = f.icon;
                return (
                <button
                  key={f.label}
                  type="button"
                  className={`wb-btn-option ${style.fontFamily === f.id ? "is-active" : ""}`}
                  onClick={() => update({ fontFamily: f.id })}
                  title={f.label}
                  aria-label={f.label}
                >
                  <Icon size={16} />
                </button>
              )})}
            </div>
          </div>

          <div className="wb-style-section">
            <label className="wb-style-label">Font size</label>
            <div className="wb-btn-group">
              {[
                { id: FONT_SIZES.SMALL, label: "S" },
                { id: FONT_SIZES.MEDIUM, label: "M" },
                { id: FONT_SIZES.LARGE, label: "L" },
                { id: FONT_SIZES.XLARGE, label: "XL" },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`wb-btn-option ${style.fontSize === s.id ? "is-active" : ""}`}
                  onClick={() => update({ fontSize: s.id })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {style.fontFamily === FONT_FAMILIES.CODE && (
            <div className="wb-style-section">
              <label className="wb-style-label" htmlFor="code-language">Code language</label>
              <select
                id="code-language"
                className="wb-code-language-select"
                value={style.codeLanguage || "javascript"}
                onChange={(e) => update({ codeLanguage: e.target.value })}
              >
                {CODE_LANGUAGES.map((language) => (
                  <option key={language.id} value={language.id}>{language.label}</option>
                ))}
              </select>
            </div>
          )}

          {style.fontFamily !== FONT_FAMILIES.CODE && (
            <div className="wb-style-section">
              <label className="wb-style-label">Text formatting</label>
              <div className="wb-btn-group wb-text-formatting">
                <button
                  type="button"
                  className={`wb-btn-option ${style.fontWeight === "700" ? "is-active" : ""}`}
                  onClick={() => update({ fontWeight: style.fontWeight === "700" ? "normal" : "700" })}
                  title="Bold"
                ><Bold size={15} /></button>
                <button
                  type="button"
                  className={`wb-btn-option ${style.fontStyle === "italic" ? "is-active" : ""}`}
                  onClick={() => update({ fontStyle: style.fontStyle === "italic" ? "normal" : "italic" })}
                  title="Italic"
                ><Italic size={15} /></button>
                <button
                  type="button"
                  className={`wb-btn-option ${style.textDecoration === "underline" ? "is-active" : ""}`}
                  onClick={() => update({ textDecoration: style.textDecoration === "underline" ? "none" : "underline" })}
                  title="Underline"
                ><Underline size={15} /></button>
              </div>
              <div className="wb-btn-group wb-text-formatting">
                <button
                  type="button"
                  className={`wb-btn-option ${style.listStyle === "bullet" ? "is-active" : ""}`}
                  onClick={() => update({ listStyle: style.listStyle === "bullet" ? "none" : "bullet" })}
                  title="Bulleted list"
                ><List size={15} /></button>
                <button
                  type="button"
                  className={`wb-btn-option ${style.listStyle === "ordered" ? "is-active" : ""}`}
                  onClick={() => update({ listStyle: style.listStyle === "ordered" ? "none" : "ordered" })}
                  title="Numbered list"
                ><ListOrdered size={15} /></button>
              </div>
            </div>
          )}

          <div className="wb-style-section">
            <label className="wb-style-label">Alignment</label>
            <div className="wb-btn-group">
              <button
                type="button"
                className={`wb-btn-option ${style.textAlign === "left" ? "is-active" : ""}`}
                onClick={() => update({ textAlign: "left" })}
                title="Align left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                className={`wb-btn-option ${style.textAlign === "center" ? "is-active" : ""}`}
                onClick={() => update({ textAlign: "center" })}
                title="Align center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                className={`wb-btn-option ${style.textAlign === "right" ? "is-active" : ""}`}
                onClick={() => update({ textAlign: "right" })}
                title="Align right"
              >
                <AlignRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Opacity */}
      <div className="wb-style-section">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <label className="wb-style-label">Opacity</label>
          <span style={{ fontSize: 12, color: "var(--color-muted-fg)" }}>{style.opacity ?? 100}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={style.opacity ?? 100}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          className="wb-slider"
        />
      </div>

      {/* Element-only actions are hidden for the Text tool defaults. */}
      {!isToolDefaults && <div className="wb-style-section wb-actions-section">
        <label className="wb-style-label">Actions</label>
        <div className="wb-actions-grid">
          <button
            type="button"
            className="wb-action-btn"
            onClick={() => onLayerChange("front")}
            title="Bring to Front (Ctrl+Shift+])"
          >
            <BringToFront size={15} />
          </button>
          <button
            type="button"
            className="wb-action-btn"
            onClick={() => onLayerChange("forward")}
            title="Bring Forward (Ctrl+])"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            className="wb-action-btn"
            onClick={() => onLayerChange("backward")}
            title="Send Backward (Ctrl+[)"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            className="wb-action-btn"
            onClick={() => onLayerChange("back")}
            title="Send to Back (Ctrl+Shift+[)"
          >
            <SendToBack size={15} />
          </button>
          <button
            type="button"
            className="wb-action-btn"
            onClick={onDuplicate}
            title="Duplicate (Ctrl+D)"
          >
            <Copy size={15} />
          </button>
          <button
            type="button"
            className={`wb-action-btn ${isAllLocked ? "is-active" : ""}`}
            onClick={onToggleLock}
            title={isAllLocked ? "Unlock (Ctrl+Shift+L)" : "Lock (Ctrl+Shift+L)"}
          >
            {isAllLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
          <button
            type="button"
            className="wb-action-btn wb-action-danger"
            onClick={onDelete}
            title="Delete (Del / Backspace)"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>}

      {/* Align & Distribute (when 2+ items selected) */}
      {!isToolDefaults && isMulti && (
        <div className="wb-style-section wb-actions-section">
          <label className="wb-style-label">Align & Distribute</label>
          <div className="wb-actions-grid">
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("left")} title="Align Left">
              <AlignLeft size={15} />
            </button>
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("center")} title="Align Center">
              <AlignCenter size={15} />
            </button>
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("right")} title="Align Right">
              <AlignRight size={15} />
            </button>
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("top")} title="Align Top">
              <AlignStartVertical size={15} />
            </button>
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("middle")} title="Align Middle">
              <AlignCenterVertical size={15} />
            </button>
            <button type="button" className="wb-action-btn" onClick={() => onAlignChange("bottom")} title="Align Bottom">
              <AlignEndVertical size={15} />
            </button>
            {selectedElements.length >= 3 && (
              <>
                <button type="button" className="wb-action-btn" onClick={() => onAlignChange("distribute-h")} title="Distribute Horizontally">
                  <AlignHorizontalDistributeCenter size={15} />
                </button>
                <button type="button" className="wb-action-btn" onClick={() => onAlignChange("distribute-v")} title="Distribute Vertically">
                  <AlignVerticalDistributeCenter size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
