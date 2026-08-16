import { X } from "lucide-react";

export default function ShortcutsModal({ onClose }) {
  const categories = [
    {
      title: "Tools",
      shortcuts: [
        { key: "1 / V", desc: "Selection tool" },
        { key: "H / Space", desc: "Hand / Pan tool" },
        { key: "2 / R", desc: "Rectangle" },
        { key: "3 / D", desc: "Diamond" },
        { key: "4 / O", desc: "Ellipse / Circle" },
        { key: "5 / A", desc: "Arrow" },
        { key: "6 / L", desc: "Line" },
        { key: "7 / P", desc: "Draw (Pencil)" },
        { key: "8 / T", desc: "Text" },
        { key: "9", desc: "Insert image" },
        { key: "0 / E", desc: "Eraser" },
        { key: "K", desc: "Laser pointer" },
      ],
    },
    {
      title: "Editor & Navigation",
      shortcuts: [
        { key: "Ctrl + Scroll", desc: "Zoom in / out" },
        { key: "Ctrl + + / -", desc: "Zoom in / out" },
        { key: "Ctrl + 0", desc: "Reset zoom to 100%" },
        { key: "Shift + 1", desc: "Zoom to fit content" },
        { key: "Ctrl + '", desc: "Toggle grid" },
        { key: "M", desc: "Toggle minimap" },
        { key: "Space + Drag", desc: "Pan canvas" },
      ],
    },
    {
      title: "Actions & Transformations",
      shortcuts: [
        { key: "Ctrl + Z", desc: "Undo" },
        { key: "Ctrl + Y / Shift+Z", desc: "Redo" },
        { key: "Ctrl + C / V", desc: "Copy / Paste" },
        { key: "Ctrl + D", desc: "Duplicate selection" },
        { key: "Del / Backspace", desc: "Delete selection" },
        { key: "Ctrl + A", desc: "Select all elements" },
        { key: "Ctrl + Shift + L", desc: "Lock / unlock selection" },
        { key: "Ctrl + ] / [", desc: "Bring forward / Send backward" },
        { key: "Ctrl + Shift + ] / [", desc: "Bring to front / Send to back" },
        { key: "Shift + Drag Handle", desc: "Maintain aspect ratio" },
        { key: "Esc", desc: "Cancel / clear selection" },
      ],
    },
  ];

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div className="wb-modal-card wb-shortcuts-card" onClick={(e) => e.stopPropagation()}>
        <div className="wb-modal-header">
          <h3>Keyboard Shortcuts</h3>
          <button type="button" className="wb-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="wb-shortcuts-grid">
          {categories.map((cat) => (
            <div key={cat.title} className="wb-shortcuts-section">
              <h4>{cat.title}</h4>
              <div className="wb-shortcuts-list">
                {cat.shortcuts.map((s) => (
                  <div key={s.key} className="wb-shortcut-row">
                    <span className="wb-shortcut-desc">{s.desc}</span>
                    <kbd className="wb-kbd">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
