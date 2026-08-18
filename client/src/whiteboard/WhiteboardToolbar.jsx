import { useState } from "react";
import {
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
  Sparkles,
  Lock,
  Unlock,
  Menu,
  Download,
  HelpCircle,
  Trash2,
  Share2,
  Sun,
  Moon,
  RotateCcw,
  Boxes,
} from "lucide-react";
import { TOOLS } from "./types.js";

export default function WhiteboardToolbar({
  tool,
  setTool,
  isLocked,
  setIsLocked,
  onExport,
  onOpenShortcuts,
  onOpenLibrary,
  onImageUpload,
  onClearCanvas,
  theme,
  onToggleTheme,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const toolButtons = [
    { id: TOOLS.HAND, icon: Hand, label: "Hand / Pan (H or Space)" },
    { id: TOOLS.SELECTION, icon: MousePointer2, label: "Selection (V or 1)" },
    { id: TOOLS.RECTANGLE, icon: Square, label: "Rectangle (R or 2)" },
    { id: TOOLS.DIAMOND, icon: Diamond, label: "Diamond (D or 3)" },
    { id: TOOLS.ELLIPSE, icon: Circle, label: "Ellipse (O or 4)" },
    { id: TOOLS.ARROW, icon: ArrowRight, label: "Arrow (A or 5)" },
    { id: TOOLS.LINE, icon: Minus, label: "Line (L or 6)" },
    { id: TOOLS.PEN, icon: Pencil, label: "Draw (P or 7)" },
    { id: TOOLS.TEXT, icon: Type, label: "Text (T or 8)" },
    { id: TOOLS.IMAGE, icon: ImageIcon, label: "Insert Image (9)" },
    { id: "library", icon: Boxes, label: "Shape Library (Pre-designed Stencils)" },
    { id: TOOLS.ERASER, icon: Eraser, label: "Eraser (E or 0)" },
    { id: TOOLS.LASER, icon: Sparkles, label: "Laser Pointer (K)" },
  ];

  const handleToolClick = (t) => {
    if (t === "library") {
      onOpenLibrary?.();
      return;
    }
    if (t === TOOLS.IMAGE) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            onImageUpload(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }
    setTool(t);
  };

  return (
    <>
      {/* Top Left Hamburger Menu */}
      <div className="wb-top-left-menu" onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={`wb-menu-btn ${showMenu ? "is-active" : ""}`}
          onClick={() => setShowMenu(!showMenu)}
          title="Canvas Menu"
        >
          <Menu size={18} />
        </button>

        {showMenu && (
          <div className="wb-dropdown-menu">
            <button
              type="button"
              className="wb-dropdown-item"
              onClick={() => { setShowMenu(false); onExport(); }}
            >
              <Download size={16} /> Export canvas…
            </button>
            <button
              type="button"
              className="wb-dropdown-item"
              onClick={() => { setShowMenu(false); onOpenLibrary?.(); }}
            >
              <Boxes size={16} /> Shape library…
            </button>
            <button
              type="button"
              className="wb-dropdown-item"
              onClick={() => { setShowMenu(false); onOpenShortcuts(); }}
            >
              <HelpCircle size={16} /> Keyboard shortcuts
            </button>
            {onToggleTheme && (
              <button
                type="button"
                className="wb-dropdown-item"
                onClick={() => { setShowMenu(false); onToggleTheme(); }}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Light theme" : "Dark theme"}
              </button>
            )}
            <div className="wb-dropdown-sep" />
            <button
              type="button"
              className="wb-dropdown-item wb-dropdown-danger"
              onClick={() => { setShowMenu(false); onClearCanvas(); }}
            >
              <Trash2 size={16} /> Clear canvas
            </button>
          </div>
        )}
      </div>

      {/* Floating Center Dock */}
      <div className="wb-topbar" role="toolbar" aria-label="Whiteboard tools" onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <div className="wb-toolbar-group">
          <button
            type="button"
            className={`wb-tool-btn ${isLocked ? "is-active is-locked" : ""}`}
            onClick={() => setIsLocked(!isLocked)}
            title={isLocked ? "Keep active tool (locked)" : "Switch to select after drawing (unlocked)"}
          >
            {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
          </button>
        </div>

        <div className="wb-toolbar-sep" />

        <div className="wb-toolbar-group">
          {toolButtons.map((t) => {
            const Icon = t.icon;
            const isActive = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`wb-tool-btn ${isActive ? "is-active" : ""}`}
                onClick={() => handleToolClick(t.id)}
                title={t.label}
                aria-label={t.label}
                aria-pressed={isActive}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Right Share/Export Button */}
      <div className="wb-top-right-actions" onMouseDown={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wb-share-btn"
          onClick={onExport}
          title="Export / Share Drawing"
        >
          <Share2 size={15} />
          <span>Export</span>
        </button>
      </div>
    </>
  );
}
