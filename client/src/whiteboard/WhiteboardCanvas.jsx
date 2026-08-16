import { useRef, useState, useEffect, useCallback } from "react";
import {
  TOOLS,
  DEFAULT_ELEMENT_STYLE,
  generateId,
} from "./types.js";
import {
  getElementBounds,
  getCombinedBounds,
  hitTestElement,
  isElementInBox,
  getTransformHandles,
  hitTestHandle,
  alignElements,
  distributeElements,
  translateElement,
} from "./geometry.js";
import { getElementPaths } from "./renderer.js";
import WhiteboardToolbar from "./WhiteboardToolbar.jsx";
import StylePanel from "./StylePanel.jsx";
import ZoomControls from "./ZoomControls.jsx";
import Minimap from "./Minimap.jsx";
import ExportModal from "./ExportModal.jsx";
import ShortcutsModal from "./ShortcutsModal.jsx";
import ArrowToolPanel from "./ArrowToolPanel.jsx";

const GRID_SIZE = 20;

export default function WhiteboardCanvas({
  initialElements = [],
  onChange,
  noteTitle = "Untitled",
  theme,
  onToggleTheme,
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Canvas Viewport (Pan & Zoom)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Active Tool & Lock
  const [tool, setTool] = useState(TOOLS.SELECTION);
  const [isLocked, setIsLocked] = useState(false);

  const selectTool = useCallback((nextTool) => {
    setTool(nextTool);
    if (nextTool !== TOOLS.SELECTION) {
      setSelectedIds([]);
      setEditingTextId(null);
    }
  }, []);

  // Elements State & Selection
  const [elements, setElements] = useState(initialElements);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_ELEMENT_STYLE);

  // Undo / Redo History
  const [history, setHistory] = useState([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Interaction State
  const [action, setAction] = useState("none"); // none | drawing | moving | resizing | selecting | panning | erasing | lasering
  const [draftElement, setDraftElement] = useState(null);
  const [marquee, setMarquee] = useState(null); // { x, y, width, height }
  const [editingTextId, setEditingTextId] = useState(null);
  const [laserPoints, setLaserPoints] = useState([]); // [{ x, y, timestamp }]

  // Dragging / Resizing references
  const dragStartRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0 });
  const activeHandleRef = useRef(null);
  const origElementsRef = useRef([]);

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Sync elements changes to parent (debounced by upstream note saver)
  const updateElements = useCallback((nextElements, pushToHistory = true) => {
    setElements(nextElements);
    onChange?.(nextElements);

    if (pushToHistory) {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, nextElements];
      });
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex, onChange]);

  // Coordinate transforms
  const screenToCanvas = useCallback((clientX, clientY) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  }, [pan, zoom]);

  const snap = useCallback((val) => {
    if (!snapToGrid) return val;
    return Math.round(val / GRID_SIZE) * GRID_SIZE;
  }, [snapToGrid]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setElements(prev);
      onChange?.(prev);
      setSelectedIds([]);
    }
  }, [history, historyIndex, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setElements(next);
      onChange?.(next);
      setSelectedIds([]);
    }
  }, [history, historyIndex, onChange]);

  // Selected elements lookup
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const selectionBounds = getCombinedBounds(selectedElements);
  const transformHandles = selectionBounds ? getTransformHandles(selectionBounds, zoom) : [];
  const showStylePanel = tool === TOOLS.SELECTION
    && action !== "drawing"
    && !draftElement
    && selectedIds.length > 0;

  // Style change handler
  const handleStyleChange = useCallback((patch) => {
    setCurrentStyle((prev) => ({ ...prev, ...patch }));
    if (selectedIds.length > 0) {
      const next = elements.map((el) => {
        if (selectedIds.includes(el.id) && !el.locked) {
          return { ...el, ...patch };
        }
        return el;
      });
      updateElements(next);
    }
  }, [elements, selectedIds, updateElements]);

  // Layer change handler (z-index)
  const handleLayerChange = useCallback((dir) => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const rest = elements.filter((el) => !selectedIds.includes(el.id));

    let next = [...elements];
    if (dir === "front") {
      next = [...rest, ...selected];
    } else if (dir === "back") {
      next = [...selected, ...rest];
    } else if (dir === "forward") {
      const idx = elements.findIndex((el) => selectedIds.includes(el.id));
      if (idx < elements.length - 1) {
        const item = elements[idx];
        next.splice(idx, 1);
        next.splice(idx + 1, 0, item);
      }
    } else if (dir === "backward") {
      const idx = elements.findIndex((el) => selectedIds.includes(el.id));
      if (idx > 0) {
        const item = elements[idx];
        next.splice(idx, 1);
        next.splice(idx - 1, 0, item);
      }
    }
    updateElements(next);
  }, [elements, selectedIds, updateElements]);

  // Align & Distribute handler
  const handleAlignChange = useCallback((type) => {
    if (selectedIds.length < 2) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    let aligned;
    if (type.startsWith("distribute")) {
      aligned = distributeElements(selected, type === "distribute-h" ? "horizontal" : "vertical");
    } else {
      aligned = alignElements(selected, type);
    }

    const alignedMap = new Map(aligned.map((el) => [el.id, el]));
    const next = elements.map((el) => alignedMap.get(el.id) || el);
    updateElements(next);
  }, [elements, selectedIds, updateElements]);

  // Duplicate handler
  const handleDuplicate = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const newItems = selected.map((el) => ({
      ...translateElement(el, 20, 20),
      id: generateId(),
      seed: Math.floor(Math.random() * 100000),
    }));
    const next = [...elements, ...newItems];
    updateElements(next);
    setSelectedIds(newItems.map((n) => n.id));
  }, [elements, selectedIds, updateElements]);

  // Delete handler
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const next = elements.filter((el) => !selectedIds.includes(el.id));
    updateElements(next);
    setSelectedIds([]);
  }, [elements, selectedIds, updateElements]);

  // Clear canvas handler
  const handleClearCanvas = useCallback(() => {
    if (elements.length === 0) return;
    if (window.confirm("Clear all elements from the canvas?")) {
      updateElements([]);
      setSelectedIds([]);
    }
  }, [elements.length, updateElements]);

  // Lock / Unlock toggle
  const handleToggleLock = useCallback(() => {
    if (selectedIds.length === 0) return;
    const allLocked = selectedElements.every((el) => el.locked);
    const next = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return { ...el, locked: !allLocked };
      }
      return el;
    });
    updateElements(next);
  }, [elements, selectedElements, selectedIds, updateElements]);

  // Zoom controls
  const handleZoom = useCallback((delta, center) => {
    setZoom((prev) => {
      const nextZoom = Math.min(5, Math.max(0.1, prev * delta));
      if (center) {
        setPan((prevPan) => ({
          x: center.x - (center.x - prevPan.x) * (nextZoom / prev),
          y: center.y - (center.y - prevPan.y) * (nextZoom / prev),
        }));
      }
      return nextZoom;
    });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (elements.length === 0 || !containerRef.current) return;
    const bounds = getCombinedBounds(elements);
    if (!bounds) return;

    const rect = containerRef.current.getBoundingClientRect();
    const padding = 80;
    const availableW = rect.width - padding * 2;
    const availableH = rect.height - padding * 2;

    const fitZoom = Math.min(1.5, Math.max(0.2, Math.min(availableW / bounds.width, availableH / bounds.height)));
    const centerX = bounds.minX + bounds.width / 2;
    const centerY = bounds.minY + bounds.height / 2;

    setZoom(fitZoom);
    setPan({
      x: rect.width / 2 - centerX * fitZoom,
      y: rect.height / 2 - centerY * fitZoom,
    });
  }, [elements]);

  // Image Upload handler
  const handleImageUpload = useCallback((src) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 400;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = (h / w) * maxDim;
          w = maxDim;
        } else {
          w = (w / h) * maxDim;
          h = maxDim;
        }
      }
      const center = screenToCanvas(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      const newEl = {
        id: generateId(),
        type: "image",
        x: center.x - w / 2,
        y: center.y - h / 2,
        width: w,
        height: h,
        src,
        opacity: currentStyle.opacity,
      };
      updateElements([...elements, newEl]);
      setSelectedIds([newEl.id]);
      setTool(TOOLS.SELECTION);
    };
    img.src = src;
  }, [currentStyle.opacity, elements, screenToCanvas, updateElements]);

  // Pointer Down handler
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    // Ignore clicks that originated inside a floating UI element (toolbar, style panel, etc.)
    // Those panels stopPropagation, but as a safety net also check for canvas/SVG targets.
    const target = e.target;
    const isOnPanel = target.closest?.('.wb-style-panel, .wb-topbar, .wb-top-left-menu, .wb-bottom-left-dock, .wb-minimap, .wb-modal-overlay');
    if (isOnPanel) return;

    const isMiddle = e.button === 1;
    const isSpaceKey = e.spaceKey;

    // Hand / Pan mode
    if (tool === TOOLS.HAND || isMiddle || isSpaceKey) {
      setAction("panning");
      dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, panX: pan.x, panY: pan.y };
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    // Laser pointer
    if (tool === TOOLS.LASER) {
      setAction("lasering");
      setLaserPoints([{ x, y, timestamp: Date.now() }]);
      return;
    }

    // Eraser mode
    if (tool === TOOLS.ERASER) {
      setAction("erasing");
      const hit = elements.find((el) => hitTestElement(el, x, y, 14));
      if (hit) {
        updateElements(elements.filter((el) => el.id !== hit.id));
      }
      return;
    }

    // Selection tool: Check transform handles first
    if (tool === TOOLS.SELECTION) {
      const hitHandle = hitTestHandle(transformHandles, x, y, zoom);
      if (hitHandle && selectedElements.length > 0) {
        setAction("resizing");
        activeHandleRef.current = hitHandle.id;
        dragStartRef.current = { x, y, bounds: { ...selectionBounds } };
        origElementsRef.current = selectedElements.map((el) => ({ ...el }));
        return;
      }

      // Check if clicking an element
      const hit = [...elements].reverse().find((el) => hitTestElement(el, x, y));
      if (hit) {
        if (e.shiftKey) {
          setSelectedIds((prev) =>
            prev.includes(hit.id) ? prev.filter((id) => id !== hit.id) : [...prev, hit.id]
          );
        } else if (!selectedIds.includes(hit.id)) {
          setSelectedIds([hit.id]);
        }

        setAction("moving");
        dragStartRef.current = { x, y };
        origElementsRef.current = elements.filter((el) =>
          (e.shiftKey ? [...selectedIds, hit.id] : selectedIds.includes(hit.id) ? selectedIds : [hit.id]).includes(el.id)
        ).map((el) => ({ ...el }));
        return;
      }

      // Clicked on empty canvas: Clear selection and start marquee
      if (!e.shiftKey) setSelectedIds([]);
      setAction("selecting");
      setMarquee({ x, y, width: 0, height: 0 });
      dragStartRef.current = { x, y };
      return;
    }

    // Text tool — place a text element and immediately open the inline editor
    if (tool === TOOLS.TEXT) {
      const newId = generateId();
      const newEl = {
        id: newId,
        type: "text",
        x: snap(x),
        y: snap(y),
        width: 200,
        height: (currentStyle.fontSize || 22) * 1.5,
        text: "",
        ...currentStyle,
      };
      updateElements([...elements, newEl]);
      setSelectedIds([newId]);
      // Use setTool directly (NOT selectTool) so editingTextId is not cleared
      if (!isLocked) setTool(TOOLS.SELECTION);
      // Open editor AFTER state is queued
      requestAnimationFrame(() => setEditingTextId(newId));
      return;
    }

    // Drawing Shapes & Pen
    const newId = generateId();
    const baseElement = {
      id: newId,
      type: tool,
      x: snap(x),
      y: snap(y),
      width: 0,
      height: 0,
      seed: Math.floor(Math.random() * 100000),
      ...currentStyle,
    };

    if (tool === TOOLS.PEN) {
      baseElement.points = [[0, 0]];
    } else if (tool === TOOLS.LINE || tool === TOOLS.ARROW) {
      baseElement.x2 = snap(x);
      baseElement.y2 = snap(y);
    }

    setAction("drawing");
    setDraftElement(baseElement);
    dragStartRef.current = { x: snap(x), y: snap(y) };
  };

  // Pointer Move handler
  const handlePointerMove = (e) => {
    if (action === "none") return;

    if (action === "panning") {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
      return;
    }

    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (action === "lasering") {
      setLaserPoints((prev) => [...prev, { x, y, timestamp: Date.now() }]);
      return;
    }

    if (action === "erasing") {
      const hit = elements.find((el) => hitTestElement(el, x, y, 14));
      if (hit) {
        updateElements(elements.filter((el) => el.id !== hit.id));
      }
      return;
    }

    if (action === "selecting") {
      const startX = dragStartRef.current.x;
      const startY = dragStartRef.current.y;
      const box = {
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
      };
      setMarquee(box);

      const matching = elements.filter((el) => isElementInBox(el, box)).map((el) => el.id);
      setSelectedIds(matching);
      return;
    }

    if (action === "moving") {
      const dx = snap(x - dragStartRef.current.x);
      const dy = snap(y - dragStartRef.current.y);

      const origMap = new Map(origElementsRef.current.map((el) => [el.id, el]));
      const next = elements.map((el) => {
        const orig = origMap.get(el.id);
        if (orig && !orig.locked) {
          return translateElement(orig, dx, dy);
        }
        return el;
      });
      setElements(next);
      return;
    }

    if (action === "resizing") {
      const handle = activeHandleRef.current;
      const startB = dragStartRef.current.bounds;
      const origMap = new Map(origElementsRef.current.map((el) => [el.id, el]));

      let newMinX = startB.minX;
      let newMinY = startB.minY;
      let newMaxX = startB.maxX;
      let newMaxY = startB.maxY;

      if (handle.includes("w")) newMinX = Math.min(x, startB.maxX - 10);
      if (handle.includes("e")) newMaxX = Math.max(x, startB.minX + 10);
      if (handle.includes("n")) newMinY = Math.min(y, startB.maxY - 10);
      if (handle.includes("s")) newMaxY = Math.max(y, startB.minY + 10);

      const scaleX = (newMaxX - newMinX) / startB.width;
      const scaleY = (newMaxY - newMinY) / startB.height;

      const next = elements.map((el) => {
        const orig = origMap.get(el.id);
        if (orig && !orig.locked) {
          const relX = (orig.x - startB.minX) * scaleX;
          const relY = (orig.y - startB.minY) * scaleY;
          const newW = (orig.width || 0) * scaleX;
          const newH = (orig.height || 0) * scaleY;

          if (orig.type === "line" || orig.type === "arrow") {
            const relX2 = ((orig.x2 ?? orig.x) - startB.minX) * scaleX;
            const relY2 = ((orig.y2 ?? orig.y) - startB.minY) * scaleY;
            return {
              ...orig,
              x: newMinX + relX,
              y: newMinY + relY,
              x2: newMinX + relX2,
              y2: newMinY + relY2,
            };
          }

          return {
            ...orig,
            x: newMinX + relX,
            y: newMinY + relY,
            width: newW,
            height: newH,
          };
        }
        return el;
      });

      setElements(next);
      return;
    }

    if (action === "drawing" && draftElement) {
      const startX = dragStartRef.current.x;
      const startY = dragStartRef.current.y;
      const curX = snap(x);
      const curY = snap(y);

      if (draftElement.type === "pen") {
        const relX = x - draftElement.x;
        const relY = y - draftElement.y;
        setDraftElement({
          ...draftElement,
          points: [...draftElement.points, [relX, relY]],
        });
      } else if (draftElement.type === "line" || draftElement.type === "arrow") {
        setDraftElement({
          ...draftElement,
          x2: curX,
          y2: curY,
        });
      } else {
        const width = curX - startX;
        const height = curY - startY;
        setDraftElement({
          ...draftElement,
          x: width < 0 ? curX : startX,
          y: height < 0 ? curY : startY,
          width: Math.abs(width),
          height: Math.abs(height),
        });
      }
    }
  };

  // Pointer Up handler
  const handlePointerUp = () => {
    if (action === "none") return;

    if (action === "drawing" && draftElement) {
      let isValid = false;
      if (draftElement.type === "pen") {
        isValid = draftElement.points.length > 1;
      } else if (draftElement.type === "line" || draftElement.type === "arrow") {
        isValid = Math.hypot(draftElement.x2 - draftElement.x, draftElement.y2 - draftElement.y) > 5;
      } else {
        isValid = draftElement.width > 5 || draftElement.height > 5;
      }

      if (isValid) {
        updateElements([...elements, draftElement]);
        // Keep the new shape selected so the left-side properties toolbox opens
        // immediately. This lets users refine colour, fill, stroke and more
        // without having to switch back and click the shape again.
        setSelectedIds([draftElement.id]);
      }
      setDraftElement(null);

      if (!isLocked) {
        setTool(TOOLS.SELECTION);
      }
    } else if (action === "moving" || action === "resizing") {
      updateElements(elements);
    }

    setAction("none");
    setMarquee(null);
  };

  // Wheel handler for zoom & pan
  const handleWheel = (e) => {
    // Don't pan/zoom if scrolling inside a floating UI panel
    const isOnPanel = e.target.closest?.('.wb-style-panel, .wb-topbar, .wb-top-left-menu, .wb-bottom-left-dock, .wb-minimap, .wb-modal-overlay');
    if (isOnPanel) return;

    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      handleZoom(zoomFactor, { x: e.clientX, y: e.clientY });
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,

      }));
    }
  };

  // Laser pointer fade timer
  useEffect(() => {
    if (laserPoints.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setLaserPoints((prev) => prev.filter((pt) => now - pt.timestamp < 1200));
    }, 50);
    return () => clearInterval(interval);
  }, [laserPoints]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") e.target.blur();
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elements.map((el) => el.id));
        return;
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      // Lock / Unlock
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        handleToggleLock();
        return;
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
        return;
      }

      // Escape
      if (e.key === "Escape") {
        setSelectedIds([]);
        setTool(TOOLS.SELECTION);
        setEditingTextId(null);
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "1":
        case "v":
          selectTool(TOOLS.SELECTION);
          break;
        case "0":
        case "h":
          selectTool(TOOLS.HAND);
          break;
        case "2":
        case "r":
          selectTool(TOOLS.RECTANGLE);
          break;
        case "3":
        case "d":
          selectTool(TOOLS.DIAMOND);
          break;
        case "4":
        case "o":
          selectTool(TOOLS.ELLIPSE);
          break;
        case "5":
        case "a":
          selectTool(TOOLS.ARROW);
          break;
        case "6":
        case "l":
          selectTool(TOOLS.LINE);
          break;
        case "7":
        case "p":
          selectTool(TOOLS.PEN);
          break;
        case "8":
        case "t":
          selectTool(TOOLS.TEXT);
          break;
        case "e":
          selectTool(TOOLS.ERASER);
          break;
        case "k":
          selectTool(TOOLS.LASER);
          break;
        case "m":
          setShowMinimap((prev) => !prev);
          break;
        case "'":
          if (e.ctrlKey) setShowGrid((prev) => !prev);
          break;
        case "?":
          setShowShortcutsModal(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, handleDuplicate, handleDeleteSelected, handleRedo, handleToggleLock, handleUndo, selectTool, selectedIds]);

  return (
    <div
      ref={containerRef}
      className={`wb-container ${tool === TOOLS.HAND || action === "panning" ? "is-panning" : ""} ${showStylePanel ? "has-style-panel" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Top Excalidraw Toolbar */}
      <WhiteboardToolbar
        tool={tool}
        setTool={selectTool}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        onExport={() => setShowExportModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onImageUpload={handleImageUpload}
        onClearCanvas={handleClearCanvas}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Left properties toolbox appears for a clicked or newly drawn shape. */}
      {showStylePanel && (
        <StylePanel
          selectedElements={selectedElements}
          currentStyle={currentStyle}
          onStyleChange={handleStyleChange}
          onLayerChange={handleLayerChange}
          onAlignChange={handleAlignChange}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteSelected}
          onToggleLock={handleToggleLock}
        />
      )}

      {/* Arrow Tool Properties Panel (appears only when the Arrow tool is active, no element selected) */}
      {tool === TOOLS.ARROW && selectedIds.length === 0 && !draftElement && (
        <ArrowToolPanel
          currentStyle={currentStyle}
          onStyleChange={handleStyleChange}
        />
      )}

      {/* Bottom Left Dock (Zoom + Undo/Redo) */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => handleZoom(1.2)}
        onZoomOut={() => handleZoom(0.8)}
        onResetZoom={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap(!showMinimap)}
      />

      {/* Radar Minimap */}
      {showMinimap && (
        <Minimap
          elements={elements}
          pan={pan}
          zoom={zoom}
          viewportSize={{
            width: containerRef.current?.clientWidth || 800,
            height: containerRef.current?.clientHeight || 600,
          }}
          onPanTo={setPan}
        />
      )}

      {/* Infinite Canvas SVG */}
      <svg
        ref={svgRef}
        className={`wb-svg-layer ${showGrid ? "has-grid" : ""}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Render all persistent elements */}
        {elements.map((el) => {
          const isSelected = selectedIds.includes(el.id);
          const opacity = (el.opacity ?? 100) / 100;

          if (el.type === "text") {
            const b = getElementBounds(el);
            const isEditing = editingTextId === el.id;
            return (
              <g key={el.id} opacity={opacity} onDoubleClick={() => setEditingTextId(el.id)}>
                <text
                  x={el.textAlign === "center" ? b.x + b.width / 2 : el.textAlign === "right" ? b.x + b.width : b.x}
                  y={b.y + (el.fontSize || 22)}
                  fontFamily={el.fontFamily || "'Caveat', cursive"}
                  fontSize={`${el.fontSize || 22}px`}
                  fill={el.strokeColor || "#1e1e1e"}
                  textAnchor={el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start"}
                  style={{ userSelect: "none", cursor: "pointer", display: isEditing ? "none" : "block" }}
                >
                  {(el.text || "").split("\n").map((line, idx) => (
                    <tspan
                      key={idx}
                      x={el.textAlign === "center" ? b.x + b.width / 2 : el.textAlign === "right" ? b.x + b.width : b.x}
                      dy={idx === 0 ? 0 : `${(el.fontSize || 22) * 1.35}px`}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          }

          if (el.type === "image") {
            const b = getElementBounds(el);
            return (
              <g key={el.id} opacity={opacity}>
                <image
                  href={el.src}
                  x={b.x}
                  y={b.y}
                  width={b.width}
                  height={b.height}
                  preserveAspectRatio="none"
                  style={{ pointerEvents: "none" }}
                />
              </g>
            );
          }

          const paths = getElementPaths(el);
          return (
            <g key={el.id} opacity={opacity}>
              {paths.map((p, pIdx) => (
                <path
                  key={pIdx}
                  d={p.d}
                  stroke={p.stroke || "none"}
                  strokeWidth={p.strokeWidth || 1}
                  fill={p.fill || "none"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          );
        })}

        {/* Render draft element currently being drawn */}
        {draftElement && (
          <g opacity={(draftElement.opacity ?? 100) / 100}>
            {getElementPaths(draftElement).map((p, pIdx) => (
              <path
                key={pIdx}
                d={p.d}
                stroke={p.stroke || "none"}
                strokeWidth={p.strokeWidth || 1}
                fill={p.fill || "none"}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        )}

        {/* Selection Bounding Box & Transform Handles (Styled in Excalidraw purple) */}
        {selectionBounds && selectedElements.length > 0 && action !== "drawing" && (
          <g className="wb-selection-overlay">
            <rect
              x={selectionBounds.minX - 4 / zoom}
              y={selectionBounds.minY - 4 / zoom}
              width={selectionBounds.width + 8 / zoom}
              height={selectionBounds.height + 8 / zoom}
              fill="none"
              stroke="#6965db"
              strokeWidth={1.5 / zoom}
              rx={4 / zoom}
            />

            {/* Top Rotation Stem & Handle */}
            <line
              x1={selectionBounds.minX + selectionBounds.width / 2}
              y1={selectionBounds.minY - 4 / zoom}
              x2={selectionBounds.minX + selectionBounds.width / 2}
              y2={selectionBounds.minY - 22 / zoom}
              stroke="#6965db"
              strokeWidth={1.5 / zoom}
            />
            <circle
              cx={selectionBounds.minX + selectionBounds.width / 2}
              cy={selectionBounds.minY - 22 / zoom}
              r={4 / zoom}
              fill="#ffffff"
              stroke="#6965db"
              strokeWidth={1.5 / zoom}
              style={{ cursor: "grab" }}
            />

            {/* Handles */}
            {transformHandles.filter(h => h.id !== "rotation").map((h) => (
              <rect
                key={h.id}
                x={h.x - 4 / zoom}
                y={h.y - 4 / zoom}
                width={8 / zoom}
                height={8 / zoom}
                fill="#ffffff"
                stroke="#6965db"
                strokeWidth={1.5 / zoom}
                rx={1.5 / zoom}
                style={{ cursor: h.cursor }}
              />
            ))}
          </g>
        )}

        {/* Marquee Selection Box */}
        {marquee && (
          <rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.width}
            height={marquee.height}
            fill="rgba(105, 101, 219, 0.08)"
            stroke="#6965db"
            strokeWidth={1 / zoom}
            strokeDasharray={`${3 / zoom}, ${3 / zoom}`}
          />
        )}

        {/* Laser Pointer Trail */}
        {laserPoints.length > 1 && (
          <g className="wb-laser-trail">
            {laserPoints.slice(1).map((pt, idx) => {
              const prev = laserPoints[idx];
              const age = Date.now() - pt.timestamp;
              const alpha = Math.max(0, 1 - age / 1200);
              return (
                <line
                  key={idx}
                  x1={prev.x}
                  y1={prev.y}
                  x2={pt.x}
                  y2={pt.y}
                  stroke="#ef4444"
                  strokeWidth={4 / zoom}
                  strokeLinecap="round"
                  opacity={alpha}
                  style={{ filter: "drop-shadow(0 0 4px #f87171)" }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Inline Text Editor */}
      {editingTextId && (() => {
        const el = elements.find((e) => e.id === editingTextId);
        if (!el) return null;
        const b = getElementBounds(el);
        const screenX = pan.x + b.x * zoom;
        const screenY = pan.y + b.y * zoom;

        return (
          <textarea
            autoFocus
            className="wb-inline-text-editor"
            style={{
              left: screenX,
              top: screenY,
              width: Math.max(200, b.width * zoom),
              minHeight: (el.fontSize || 22) * zoom * 1.5,
              fontSize: `${(el.fontSize || 22) * zoom}px`,
              fontFamily: el.fontFamily || "'Caveat', cursive",
              color: el.strokeColor || "#1e1e1e",
              textAlign: el.textAlign || "left",
            }}
            value={el.text || ""}
            placeholder="Type here…"
            onChange={(changeEvt) => {
              const text = changeEvt.target.value;
              const lines = text.split("\n");
              const maxLineLen = Math.max(...lines.map((l) => l.length), 5);
              const charWidth = (el.fontSize || 22) * 0.6;
              const nextWidth = Math.max(120, maxLineLen * charWidth);
              const nextHeight = Math.max(
                (el.fontSize || 22) * 1.5,
                lines.length * (el.fontSize || 22) * 1.4
              );
              const next = elements.map((item) =>
                item.id === el.id ? { ...item, text, width: nextWidth, height: nextHeight } : item
              );
              setElements(next);
            }}
            onBlur={() => {
              const currentEl = elements.find((item) => item.id === el.id);
              if (!currentEl || !currentEl.text || currentEl.text.trim() === "") {
                const filtered = elements.filter((item) => item.id !== el.id);
                updateElements(filtered);
                setSelectedIds([]);
              } else {
                updateElements(elements);
              }
              setEditingTextId(null);
            }}
            onPointerDown={(pEvt) => pEvt.stopPropagation()}
            onMouseDown={(mEvt) => mEvt.stopPropagation()}
            onClick={(cEvt) => cEvt.stopPropagation()}
            onWheel={(wEvt) => wEvt.stopPropagation()}
            onKeyDown={(kEvt) => {
              // Stop key events from triggering canvas tool shortcuts
              kEvt.stopPropagation();
              if (kEvt.key === "Escape") {
                const currentEl = elements.find((item) => item.id === el.id);
                if (!currentEl || !currentEl.text || currentEl.text.trim() === "") {
                  const filtered = elements.filter((item) => item.id !== el.id);
                  updateElements(filtered);
                  setSelectedIds([]);
                } else {
                  updateElements(elements);
                }
                setEditingTextId(null);
              }
            }}
          />
        );
      })()}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          elements={elements}
          noteTitle={noteTitle}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}
    </div>
  );
}
