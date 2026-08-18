import { useEffect, useRef, useState, useCallback } from "react";
import { PanelLeftOpen, LogOut, User as UserIcon } from "lucide-react";
import { api } from "./api.js";
import AuthScreen from "./components/AuthScreen.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import WhiteboardCanvas from "./whiteboard/WhiteboardCanvas.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
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

  useEffect(() => {
    if (!localStorage.getItem("notely-token")) {
      setCheckingSession(false);
      return;
    }
    api.me()
      .then((res) => setUser(res?.user || res))
      .catch(() => localStorage.removeItem("notely-token"))
      .finally(() => setCheckingSession(false));
  }, []);

  // Initial load.
  useEffect(() => {
    if (!user) return;
    api.list()
      .then(async (list) => {
        setNotes(list);
        if (list.length) {
          try {
            await openNote(list[0]._id);
            return;
          } catch (e) {
            console.error("Failed opening note:", e);
          }
        }

        try {
          const note = await api.create({ title: "Whiteboard" });
          setNotes([{ _id: note._id, title: note.title, updatedAt: note.updatedAt }]);
          setActiveId(note._id);
          setActiveNote(note);
        } catch (e) {
          const fallback = { _id: "local-workspace", title: "Whiteboard", drawing: [] };
          setActiveId(fallback._id);
          setActiveNote(fallback);
        }
      })
      .catch((e) => {
        setError(e.message);
        const fallback = { _id: "local-workspace", title: "Whiteboard", drawing: [] };
        setActiveId(fallback._id);
        setActiveNote(fallback);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const logout = () => {
    localStorage.removeItem("notely-token");
    setNotes([]);
    setActiveId(null);
    setActiveNote(null);
    setUser(null);
  };

  const openNote = async (id) => {
    await flush(); // persist any pending edits before switching
    try {
      const note = await api.get(id);
      setActiveId(id);
      setActiveNote(note);
      setSaveState("idle");
    } catch (e) {
      setError(e.message);
      if (!activeNote) {
        const fallback = { _id: id, title: "Whiteboard", drawing: [] };
        setActiveId(id);
        setActiveNote(fallback);
      }
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

  // Keep this authentication gate after every hook in this component. Returning
  // before useCallback would make the hook order change when a user signs in.
  if (checkingSession) return null;
  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  const onTitle = (title) => {
    setActiveNote((note) => ({ ...note, title }));
    scheduleSave({ title });
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
    if (!window.confirm("Delete this page? This cannot be undone.")) return;
    try {
      await api.remove(id);
      const rest = notes.filter((note) => note._id !== id);
      setNotes(rest);
      if (id === activeId) {
        pending.current = null;
        if (rest.length) await openNote(rest[0]._id);
        else await createNote();
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
          onToggleTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
          user={user}
          onOpenProfile={() => setShowProfile(true)}
        />
      )}
      <main className="main">
        {activeNote ? (
          <>
            <div className="topbar">
              {collapsed && (
                <button className="icon-btn" title="Show sidebar (Ctrl+\)" onClick={() => setCollapsed(false)}>
                  <PanelLeftOpen size={18} />
                </button>
              )}
              <input
                className="title-input"
                value={activeNote.title || ""}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Untitled whiteboard"
                aria-label="Whiteboard title"
              />
              <span className={`save-badge save-badge--${saveState}`}>
                <span className="save-dot" />
                <span>{saveLabel}</span>
              </span>
              {user && (
                <button
                  type="button"
                  className="topbar-user-badge"
                  onClick={() => setShowProfile(true)}
                  title={`Signed in as ${user.email} (Click to open profile)`}
                >
                  {user.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}` : user.email?.[0]?.toUpperCase() || "U"}
                </button>
              )}
              <button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17} /></button>
            </div>
            <WhiteboardCanvas
              key={`wb-${activeNote._id}`}
              initialElements={activeNote.drawing || []}
              onChange={onDrawingChange}
              noteTitle={activeNote.title || "Whiteboard"}
              theme={theme}
              onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            />
          </>
        ) : (
          <div className="empty">
            <h2>Preparing your workspace…</h2>
            <p>Loading your whiteboards and canvas tools.</p>
          </div>
        )}

        {showProfile && user && (
          <ProfileModal
            user={user}
            notesCount={notes.length}
            onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onLogout={logout}
            onClose={() => setShowProfile(false)}
          />
        )}

        {error && (
          <div
            style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              background: "var(--color-destructive)", color: "#fff", padding: "10px 18px",
              borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 550,
              boxShadow: "var(--shadow-floating)", zIndex: 1000, display: "flex",
              alignItems: "center", gap: 8, cursor: "pointer",
            }}
            onClick={() => setError(null)}
          >
            <span>{error} · Click to dismiss</span>
          </div>
        )}
      </main>
    </div>
  );
}

