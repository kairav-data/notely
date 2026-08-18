import { Plus, Search, Trash2, PanelLeftClose, Sun, Moon, FileText, Sparkles, X } from "lucide-react";

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
  onCollapse, theme, onToggleTheme, user, onOpenProfile,
}) {
  const filtered = notes.filter((n) =>
    (n.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <div className="brand" title="Notely Workspace">
          <div className="brand__mark">
            <Sparkles size={17} />
          </div>
          <div className="brand__name">Notely</div>
        </div>
        <button className="icon-btn" title="Collapse sidebar (Ctrl+\)" onClick={onCollapse}>
          <PanelLeftClose size={18} />
        </button>
      </div>

      <button className="new-note" onClick={onCreate} title="Create new whiteboard (Alt+N)">
        <div className="new-note-left">
          <Plus size={16} />
          <span>New note</span>
        </div>
        <span className="new-note-kbd">⌘N</span>
      </button>

      <div className="search">
        <Search size={15} />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search notes…"
          aria-label="Search notes"
        />
        {query ? (
          <button
            type="button"
            className="icon-btn"
            style={{ width: 20, height: 20, padding: 0 }}
            onClick={() => onQuery("")}
            title="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="search-badge">/</span>
        )}
      </div>

      <div className="note-list">
        {filtered.length === 0 && (
          <div style={{ padding: "24px 14px", color: "var(--color-muted-fg)", fontSize: 13, textAlign: "center" }}>
            {notes.length === 0 ? "No notes yet. Create your first whiteboard!" : "No matching notes found."}
          </div>
        )}
        {filtered.map((n) => (
          <button
            key={n._id}
            className={`note-item ${n._id === activeId ? "active" : ""}`}
            onClick={() => onSelect(n._id)}
          >
            <div className="note-item-main">
              <span className="note-item__title">{n.title || "Untitled whiteboard"}</span>
              <span className="note-item__meta">{when(n.updatedAt)}</span>
            </div>
            <span
              className="note-item__del"
              role="button"
              title="Delete note"
              onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
            >
              <Trash2 size={14} />
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar__foot">
        <button
          type="button"
          className="sidebar-user-btn"
          onClick={onOpenProfile}
          title="View MongoDB User Profile"
        >
          <div className="sidebar-user-avatar">
            {userInitials}
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email?.split("@")[0] || "User Profile"}
            </span>
            <span className="sidebar-user-sub">
              {notes.length} note{notes.length === 1 ? "" : "s"} · Profile
            </span>
          </div>
        </button>

        <button
          className="icon-btn"
          title={theme === "dark" ? "Switch to Light theme" : "Switch to Dark theme"}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </aside>
  );
}

