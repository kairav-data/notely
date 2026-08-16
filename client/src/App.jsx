import { useEffect, useRef, useState, useCallback } from "react";
import { PanelLeftOpen, FileText, Palette, Columns2 } from "lucide-react";
import { api } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import Canvas from "./components/Canvas.jsx";
import WhiteboardCanvas from "./whiteboard/WhiteboardCanvas.jsx";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("note"); // note | whiteboard | split
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("notely-theme") || "light"
  );

  const saveTimer = useRef(null);
  const pending = useRef(null); // latest { title, content, drawing, blocks } waiting to be flushed

  // Theme.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("notely-theme", theme);
  }, [theme]);

  // Initial load.
  useEffect(() => {
    api.list()
      .then(async (list) => {
        setNotes(list);
        if (list.length) await openNote(list[0]._id);
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNote = async (id) => {
    await flush(); // persist any pending edits before switching
    try {
      const note = await api.get(id);
      setActiveId(id);
      setActiveNote(note);
      setSaveState("idle");
    } catch (e) {
      setError(e.message);
    }
  };

  const flush = useCallback(async () => {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    if (!pending.current || !activeId) return;
    const payload = pending.current;
    pending.current = null;
    try {
      const updated = await api.update(activeId, payload);
      setSaveState("saved");
      setNotes((prev) => {
        const rest = prev.filter((n) => n._id !== activeId);
        return [{ _id: activeId, title: updated.title, updatedAt: updated.updatedAt }, ...rest];
      });
    } catch (e) {
      setError(e.message);
    }
  }, [activeId]);

  const scheduleSave = useCallback((payload) => {
    pending.current = { ...pending.current, ...payload };
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => flush(), 700);
  }, [flush]);

  const onTitle = (title) => {
    setActiveNote((n) => ({ ...n, title }));
    scheduleSave({ title });
  };

  const onBlocksChange = (blocks) => {
    scheduleSave({ blocks });
  };

  const onDrawingChange = (drawing) => {
    setActiveNote((n) => ({ ...n, drawing }));
    scheduleSave({ drawing });
  };

  const createNote = async () => {
    await flush();
    try {
      const note = await api.create({ title: "Untitled" });
      setNotes((prev) => [{ _id: note._id, title: note.title, updatedAt: note.updatedAt }, ...prev]);
      setActiveId(note._id);
      setActiveNote(note);
      setSaveState("idle");
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.remove(id);
      const rest = notes.filter((n) => n._id !== id);
      setNotes(rest);
      if (id === activeId) {
        pending.current = null;
        if (rest.length) await openNote(rest[0]._id);
        else { setActiveId(null); setActiveNote(null); }
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const saveLabel = { idle: "", saving: "Saving…", saved: "Saved" }[saveState];

  return (
    <div className="app">
      {!collapsed && (
        <Sidebar
          notes={notes}
          activeId={activeId}
          query={query}
          onQuery={setQuery}
          onSelect={openNote}
          onCreate={createNote}
          onDelete={deleteNote}
          onCollapse={() => setCollapsed(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
      )}

      <main className="main">
        {activeNote ? (
          <>
            <div className="topbar">
              {collapsed && (
                <button className="icon-btn" title="Show sidebar" onClick={() => setCollapsed(false)}>
                  <PanelLeftOpen size={19} />
                </button>
              )}
              <input
                className="title-input"
                value={activeNote.title || ""}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Untitled"
                aria-label="Note title"
              />

              {/* View Mode Switcher */}
              <div className="view-mode-switcher" role="tablist" aria-label="View mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "note"}
                  className={`view-mode-btn ${viewMode === "note" ? "is-active" : ""}`}
                  onClick={() => setViewMode("note")}
                  title="Document Notes View"
                >
                  <FileText size={15} />
                  <span>Notes</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "whiteboard"}
                  className={`view-mode-btn ${viewMode === "whiteboard" ? "is-active" : ""}`}
                  onClick={() => setViewMode("whiteboard")}
                  title="Excalidraw Whiteboard View"
                >
                  <Palette size={15} />
                  <span>Whiteboard</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "split"}
                  className={`view-mode-btn ${viewMode === "split" ? "is-active" : ""}`}
                  onClick={() => setViewMode("split")}
                  title="Split View (Notes + Whiteboard)"
                >
                  <Columns2 size={15} />
                  <span>Split</span>
                </button>
              </div>

              <span className="save-state">{saveLabel}</span>
            </div>

            {/* View Containers */}
            {viewMode === "note" && (
              <Canvas
                key={`note-${activeNote._id}`}
                note={activeNote}
                onBlocksChange={onBlocksChange}
                onDrawingChange={onDrawingChange}
              />
            )}

            {viewMode === "whiteboard" && (
              <WhiteboardCanvas
                key={`wb-${activeNote._id}`}
                initialElements={activeNote.drawing || []}
                onChange={onDrawingChange}
                noteTitle={activeNote.title || "Untitled"}
                theme={theme}
                onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              />
            )}

            {viewMode === "split" && (
              <div className="split-view-container">
                <div className="split-pane split-pane-left">
                  <Canvas
                    key={`split-note-${activeNote._id}`}
                    note={activeNote}
                    onBlocksChange={onBlocksChange}
                    onDrawingChange={onDrawingChange}
                  />
                </div>
                <div className="split-pane split-pane-right">
                  <WhiteboardCanvas
                    key={`split-wb-${activeNote._id}`}
                    initialElements={activeNote.drawing || []}
                    onChange={onDrawingChange}
                    noteTitle={activeNote.title || "Untitled"}
                    theme={theme}
                    onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty">
            {collapsed && (
              <button className="icon-btn" onClick={() => setCollapsed(false)}>
                <PanelLeftOpen size={19} />
              </button>
            )}
            <h2>A quiet place to think.</h2>
            <p>
              Rich text, syntax-highlighted code in any language, and an infinite
              Excalidraw whiteboard for diagrams & sketching — all saved locally.
            </p>
            <button className="new-note" style={{ margin: 0 }} onClick={createNote}>
              Create your first note
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
              background: "var(--color-destructive)", color: "#fff", padding: "10px 16px",
              borderRadius: 10, fontSize: 13.5, boxShadow: "var(--shadow-md)", zIndex: 100,
            }}
            onClick={() => setError(null)}
          >
            {error} · is MongoDB running? (tap to dismiss)
          </div>
        )}
      </main>
    </div>
  );
}
