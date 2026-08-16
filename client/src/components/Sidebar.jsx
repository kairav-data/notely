import { Plus, Search, Trash2, PanelLeftClose, Sun, Moon } from "lucide-react";

function when(d) {
  if (!d) return "";
  const date = new Date(d);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Sidebar({
  notes, activeId, query, onQuery, onSelect, onCreate, onDelete,
  onCollapse, theme, onToggleTheme,
}) {
  const filtered = notes.filter((n) =>
    (n.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <div className="brand">
          <div className="brand__mark">N</div>
          <div className="brand__name">Notely</div>
        </div>
        <button className="icon-btn" title="Hide sidebar" onClick={onCollapse}>
          <PanelLeftClose size={19} />
        </button>
      </div>

      <button className="new-note" onClick={onCreate}>
        <Plus size={17} /> New note
      </button>

      <div className="search">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search notes"
          aria-label="Search notes"
        />
      </div>

      <div className="note-list">
        {filtered.length === 0 && (
          <div style={{ padding: "18px 14px", color: "var(--color-muted-fg)", fontSize: 13.5 }}>
            {notes.length === 0 ? "No notes yet. Create your first one." : "No matches."}
          </div>
        )}
        {filtered.map((n) => (
          <button
            key={n._id}
            className={`note-item ${n._id === activeId ? "active" : ""}`}
            onClick={() => onSelect(n._id)}
          >
            <span className="note-item__title">{n.title || "Untitled"}</span>
            <span className="note-item__meta">{when(n.updatedAt)}</span>
            <span
              className="note-item__del"
              role="button"
              title="Delete note"
              onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
            >
              <Trash2 size={15} />
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar__foot">
        <span>{notes.length} note{notes.length === 1 ? "" : "s"}</span>
        <button className="icon-btn" title="Toggle theme" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </aside>
  );
}
