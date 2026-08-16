import { Plus, Minus, Undo2, Redo2, Grid, Magnet, Compass } from "lucide-react";

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  showMinimap,
  onToggleMinimap,
}) {
  const percent = Math.round(zoom * 100);

  return (
    <div
      className="wb-bottom-left-dock"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="wb-zoom-controls">
        <button
          type="button"
          className="wb-control-btn"
          onClick={onZoomOut}
          title="Zoom Out (Ctrl -)"
        >
          <Minus size={15} />
        </button>

        <button
          type="button"
          className="wb-control-btn wb-zoom-display"
          onClick={onResetZoom}
          title="Reset Zoom to 100% (Ctrl 0)"
        >
          {percent}%
        </button>

        <button
          type="button"
          className="wb-control-btn"
          onClick={onZoomIn}
          title="Zoom In (Ctrl +)"
        >
          <Plus size={15} />
        </button>

        <div className="wb-zoom-sep" />

        <button
          type="button"
          className="wb-control-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        <button
          type="button"
          className="wb-control-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
        >
          <Redo2 size={15} />
        </button>
      </div>

      <div className="wb-secondary-controls">
        <button
          type="button"
          className={`wb-control-btn ${showGrid ? "is-active" : ""}`}
          onClick={onToggleGrid}
          title="Toggle Grid (Ctrl ')"
        >
          <Grid size={15} />
        </button>

        <button
          type="button"
          className={`wb-control-btn ${snapToGrid ? "is-active" : ""}`}
          onClick={onToggleSnap}
          title="Snap to Grid"
        >
          <Magnet size={15} />
        </button>

        <button
          type="button"
          className={`wb-control-btn ${showMinimap ? "is-active" : ""}`}
          onClick={onToggleMinimap}
          title="Toggle Minimap (M)"
        >
          <Compass size={15} />
        </button>
      </div>
    </div>
  );
}
