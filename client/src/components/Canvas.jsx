import { useEffect, useRef, useState, useCallback } from "react";
import Toolbar from "./Toolbar.jsx";
import DrawToolbar from "./DrawToolbar.jsx";
import DrawLayer from "./DrawLayer.jsx";
import CanvasBlock from "./CanvasBlock.jsx";
import { uid } from "./drawShapes.jsx";

const emptyDoc = () => ({ type: "doc", content: [{ type: "paragraph" }] });

// Build the initial block list, migrating a legacy linear note if present.
function initBlocks(note) {
  if (Array.isArray(note.blocks) && note.blocks.length) return note.blocks;
  if (note.content && JSON.stringify(note.content).includes('"text"')) {
    return [{ id: uid(), kind: "text", x: 48, y: 48, width: 680, z: 1, content: note.content }];
  }
  return [];
}

export default function Canvas({ note, onBlocksChange, onDrawingChange }) {
  const scrollRef = useRef(null);
  const zRef = useRef(10);
  const firstRender = useRef(true);

  const [blocks, setBlocks] = useState(() => initBlocks(note));
  const [activeId, setActiveId] = useState(null);
  const [activeEditor, setActiveEditor] = useState(null);

  // Drawing overlay state.
  const [drawMode, setDrawMode] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#0f172a");
  const [width, setWidth] = useState(4);
  const [selId, setSelId] = useState(null);
  const [shapes, setShapes] = useState(note.drawing || []);

  // Persist block changes (debounced upstream), skipping the initial mount.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    onBlocksChange(blocks.map(({ autoFocus, ...b }) => b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const patchBlock = useCallback((id, patch) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const selectBlock = useCallback((id) => {
    setActiveId(id);
    patchBlock(id, { z: ++zRef.current });
  }, [patchBlock]);

  const deleteBlock = useCallback((id) => {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
    setActiveEditor(null);
  }, []);

  const addTextBlock = (x, y) => {
    const id = uid();
    setBlocks((bs) => [...bs, { id, kind: "text", x, y, width: 340, z: ++zRef.current, content: emptyDoc(), autoFocus: true }]);
    setActiveId(id);
  };

  const addCodeBlock = (x, y) => {
    const id = uid();
    setBlocks((bs) => [...bs, { id, kind: "code", x, y, width: 460, z: ++zRef.current, code: "", language: "python" }]);
    setActiveId(id);
  };

  // A fresh, unedited text block is discarded when it loses focus (OneNote-style).
  const handleBlurEmpty = (id, isEmpty) => {
    setActiveEditor(null);
    if (isEmpty) setBlocks((bs) => bs.filter((b) => b.id !== id));
  };

  // Where new blocks land when added from the toolbar: current viewport corner.
  const spawnPoint = () => {
    const el = scrollRef.current;
    return el ? { x: el.scrollLeft + 90, y: el.scrollTop + 90 } : { x: 90, y: 90 };
  };

  const changeShapes = (next) => {
    setShapes(next);
    onDrawingChange(next);
  };

  const deleteSelectedShape = () => {
    if (!selId) return;
    changeShapes(shapes.filter((s) => s.id !== selId));
    setSelId(null);
  };

  const onCanvasPointerDown = (e) => {
    if (drawMode) return;
    if (e.target === e.currentTarget) {
      setActiveId(null);
      setActiveEditor(null);
      addTextBlock(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };

  const onKeyDown = (e) => {
    if (drawMode && selId && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      deleteSelectedShape();
    }
  };

  // Canvas grows to contain every block, with generous slack for free placement.
  const size = blocks.reduce(
    (a, b) => ({ w: Math.max(a.w, b.x + b.width + 500), h: Math.max(a.h, b.y + 700) }),
    { w: 1400, h: 1000 }
  );

  return (
    <div className="editor-scroll" ref={scrollRef} onKeyDown={onKeyDown} tabIndex={-1}>
      {drawMode ? (
        <DrawToolbar
          tool={tool} setTool={setTool}
          color={color} setColor={setColor}
          width={width} setWidth={setWidth}
          hasSelection={!!selId}
          onDeleteSelected={deleteSelectedShape}
          onClear={() => { changeShapes([]); setSelId(null); }}
          onDone={() => { setDrawMode(false); setSelId(null); }}
        />
      ) : (
        <Toolbar
          editor={activeEditor}
          onAddText={() => { const p = spawnPoint(); addTextBlock(p.x, p.y); }}
          onAddCode={() => { const p = spawnPoint(); addCodeBlock(p.x, p.y); }}
          onDraw={() => { setDrawMode(true); setActiveId(null); }}
        />
      )}

      <div
        className={`canvas ${drawMode ? "is-drawing" : ""}`}
        style={{ width: size.w, height: size.h }}
        onPointerDown={onCanvasPointerDown}
      >
        {blocks.map((b) => (
          <CanvasBlock
            key={b.id}
            block={b}
            active={activeId === b.id}
            onPatch={(patch) => patchBlock(b.id, patch)}
            onDelete={() => deleteBlock(b.id)}
            onSelect={() => selectBlock(b.id)}
            onFocusEditor={setActiveEditor}
            onBlurEmpty={(isEmpty) => handleBlurEmpty(b.id, isEmpty)}
          />
        ))}

        <DrawLayer
          active={drawMode}
          shapes={shapes}
          onChange={changeShapes}
          tool={tool}
          color={color}
          width={width}
          selId={selId}
          setSelId={setSelId}
        />
      </div>

      {blocks.length === 0 && !drawMode && (
        <div className="canvas-hint">Click anywhere to start a note · use the toolbar to add code or draw</div>
      )}
    </div>
  );
}
