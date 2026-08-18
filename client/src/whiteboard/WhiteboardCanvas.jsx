import { useRef, useState, useEffect, useCallback } from "react";
import hljs from "highlight.js/lib/common";
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
  getElbowArrowPoints,
  alignElements,
  distributeElements,
  translateElement,
  getArrowHandles,
  getCurvedArrowControlPoint,
  rotatePoint,
  getShapeAnchors,
  findBestShapeBinding,
  updateConnectedArrows,
  getLabelPosition,
  getNumericFontSize,
} from "./geometry.js";
import { getElementPaths } from "./renderer.js";
import WhiteboardToolbar from "./WhiteboardToolbar.jsx";
import StylePanel from "./StylePanel.jsx";
import ZoomControls from "./ZoomControls.jsx";
import Minimap from "./Minimap.jsx";
import ExportModal from "./ExportModal.jsx";
import ShortcutsModal from "./ShortcutsModal.jsx";
import ArrowToolPanel from "./ArrowToolPanel.jsx";
import LibraryModal from "./LibraryModal.jsx";

const GRID_SIZE = 20;

function getHighlightedCode(source, language) {
  const code = source || "";
  const selectedLanguage = language || "javascript";
  if (!hljs.getLanguage(selectedLanguage)) {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  return hljs.highlight(code, { language: selectedLanguage, ignoreIllegals: true }).value;
}

function getElbowHandles(el) {
  const points = getElbowArrowPoints(el) || [];
  if (points.length < 2) return { points, endpoints: [], segmentHandles: [] };

  // Only start and end points get hollow circles (matching Excalidraw)
  const endpoints = [
    {
      id: `elbow-point-start`,
      kind: "point",
      index: 0,
      x: points[0].x,
      y: points[0].y,
    },
    {
      id: `elbow-point-end`,
      kind: "point",
      index: points.length - 1,
      x: points[points.length - 1].x,
      y: points[points.length - 1].y,
    },
  ];

  // Filled purple dots for each segment midpoint
  const segmentHandles = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    segmentHandles.push({
      id: `elbow-segment-${i}`,
      kind: "segment",
      index: i,
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    });
  }

  return { points, endpoints, segmentHandles };
}

function createElbowDetour(points, segmentIndex, x, y) {
  const start = points[segmentIndex];
  const end = points[segmentIndex + 1];
  if (!start || !end) return points;

  // Replace one edge with a clean two-corner detour. A horizontal edge dragged
  // upward becomes vertical → horizontal → vertical, as in the reference.
  const detour = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y)
    ? [{ x: start.x, y }, { x: end.x, y }]
    : [{ x, y: start.y }, { x, y: end.y }];
  return [...points.slice(0, segmentIndex + 1), ...detour, ...points.slice(segmentIndex + 1)];
}


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
  const [bindElements, setBindElements] = useState(true);
  const [bindingSnapIndicator, setBindingSnapIndicator] = useState(null);

  const selectTool = useCallback((nextTool) => {
    setTool(nextTool);
    if (containerRef.current) containerRef.current.style.cursor = "";
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
  const [showLibraryModal, setShowLibraryModal] = useState(false);

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
  const hasOnlyArrows = selectedElements.length > 0
    && selectedElements.every((el) => el.type === TOOLS.ARROW);
  const selectedElbowArrow = selectedElements.length === 1
    && selectedElements[0].type === TOOLS.ARROW
    && selectedElements[0].arrowType === "elbow"
    ? selectedElements[0]
    : null;
  const elbowHandles = selectedElbowArrow ? getElbowHandles(selectedElbowArrow) : null;
  const selectedSingleArrowOrLine = selectedElements.length === 1
    && (selectedElements[0].type === TOOLS.ARROW || selectedElements[0].type === TOOLS.LINE)
    && selectedElements[0].arrowType !== "elbow"
    ? selectedElements[0]
    : null;
  const arrowHandles = selectedSingleArrowOrLine ? getArrowHandles(selectedSingleArrowOrLine) : null;
  const showStylePanel = tool === TOOLS.SELECTION
    && action !== "drawing"
    && !draftElement
    && selectedIds.length > 0
    && !hasOnlyArrows;
  const showTextToolPanel = tool === TOOLS.TEXT;
  const showArrowToolPanel = action !== "drawing"
    && !draftElement
    && (
      // Configure the next arrow before drawing it.
      (tool === TOOLS.ARROW && selectedIds.length === 0)
      // Use arrow-specific controls whenever arrow(s) are selected for editing.
      || (tool === TOOLS.SELECTION && hasOnlyArrows)
    );
  const arrowPanelStyle = hasOnlyArrows && selectedElements.length === 1
    ? { ...currentStyle, ...selectedElements[0] }
    : currentStyle;

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

  // Insert Library Stencils / Shapes
  const handleInsertLibraryElements = useCallback((newEls) => {
    if (!newEls || newEls.length === 0) return;

    const bounds = getCombinedBounds(newEls);
    const stencilCenterX = bounds.minX + bounds.width / 2;
    const stencilCenterY = bounds.minY + bounds.height / 2;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const viewCenterX = (containerWidth / 2 - pan.x) / zoom;
    const viewCenterY = (containerHeight / 2 - pan.y) / zoom;

    const offsetX = viewCenterX - stencilCenterX;
    const offsetY = viewCenterY - stencilCenterY;

    const idMap = new Map();
    const created = newEls.map((el) => {
      const freshId = generateId();
      idMap.set(el.id, freshId);
      return translateElement({ ...el, id: freshId }, offsetX, offsetY);
    });

    const remapped = created.map((el) => {
      let item = { ...el };
      if (item.startBinding && idMap.has(item.startBinding.elementId)) {
        item.startBinding = { ...item.startBinding, elementId: idMap.get(item.startBinding.elementId) };
      }
      if (item.endBinding && idMap.has(item.endBinding.elementId)) {
        item.endBinding = { ...item.endBinding, elementId: idMap.get(item.endBinding.elementId) };
      }
      return item;
    });

    updateElements([...elements, ...remapped]);
    setSelectedIds(remapped.map((item) => item.id));
  }, [elements, pan.x, pan.y, updateElements, zoom]);

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
      if (selectedSingleArrowOrLine && arrowHandles) {
        const arrowHandle = hitTestHandle(arrowHandles, x, y, zoom, 10);
        if (arrowHandle) {
          setAction("editing-arrow-handle");
          activeHandleRef.current = arrowHandle;
          origElementsRef.current = [{ ...selectedSingleArrowOrLine }];
          dragStartRef.current = { x, y };
          return;
        }
      }
      if (selectedElbowArrow && elbowHandles) {
        const elbowHandle = hitTestHandle(
          [...elbowHandles.endpoints, ...elbowHandles.segmentHandles], x, y, zoom, 9
        );
        if (elbowHandle) {
          setAction(elbowHandle.kind === "point"
            ? "editing-elbow-point"
            : "editing-elbow-segment");
          activeHandleRef.current = elbowHandle;
          origElementsRef.current = [{ ...selectedElbowArrow, elbowPoints: elbowHandles.points }];
          dragStartRef.current = { x, y };
          return;
        }
      }
      const singleRot = selectedElements.length === 1 ? (selectedElements[0].angle || 0) : 0;
      let targetX = x;
      let targetY = y;
      if (singleRot && selectionBounds) {
        const cx = selectionBounds.minX + selectionBounds.width / 2;
        const cy = selectionBounds.minY + selectionBounds.height / 2;
        const unrot = rotatePoint(x, y, cx, cy, -singleRot);
        targetX = unrot.x;
        targetY = unrot.y;
      }

      const hitHandle = hitTestHandle(transformHandles, targetX, targetY, zoom, 12);
      if (hitHandle && selectedElements.length > 0) {
        if (hitHandle.id === "rotation") {
          setAction("rotating");
          activeHandleRef.current = hitHandle.id;
          const center = {
            cx: selectionBounds.minX + selectionBounds.width / 2,
            cy: selectionBounds.minY + selectionBounds.height / 2,
          };
          dragStartRef.current = {
            ...center,
            startAngle: Math.atan2(y - center.cy, x - center.cx),
          };
          origElementsRef.current = selectedElements.map((el) => ({ ...el }));
          return;
        }
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
      if (bindElements) {
        const startSnap = findBestShapeBinding(x, y, elements);
        if (startSnap) {
          baseElement.x = startSnap.x;
          baseElement.y = startSnap.y;
          baseElement.startBinding = { elementId: startSnap.elementId, anchorId: startSnap.anchorId };
        }
      }
    }

    setAction("drawing");
    setDraftElement(baseElement);
    dragStartRef.current = { x: snap(x), y: snap(y) };
  };

  // SVG elements are rendered with pointer events disabled so canvas gestures
  // can be handled consistently by the container. Resolve text double-clicks
  // here to open the inline editor for existing text.
  const handleDoubleClick = (e) => {
    if (e.target.closest?.('.wb-style-panel, .wb-topbar, .wb-top-left-menu, .wb-bottom-left-dock, .wb-minimap, .wb-modal-overlay')) {
      return;
    }
    const { x, y } = screenToCanvas(e.clientX, e.clientY);
    const textElement = [...elements].reverse().find(
      (el) => el.type === TOOLS.TEXT && hitTestElement(el, x, y)
    );
    if (!textElement) return;

    setTool(TOOLS.SELECTION);
    setSelectedIds([textElement.id]);
    setEditingTextId(textElement.id);
  };

  // Pointer Move handler
  const handlePointerMove = (e) => {
    const { x, y } = screenToCanvas(e.clientX, e.clientY);

    if (action === "none") {
      if (tool === TOOLS.SELECTION) {
        const singleRot = selectedElements.length === 1 ? (selectedElements[0].angle || 0) : 0;
        let targetX = x;
        let targetY = y;
        if (singleRot && selectionBounds) {
          const cx = selectionBounds.minX + selectionBounds.width / 2;
          const cy = selectionBounds.minY + selectionBounds.height / 2;
          const unrot = rotatePoint(x, y, cx, cy, -singleRot);
          targetX = unrot.x;
          targetY = unrot.y;
        }

        // 1. Check transform handles first (corners nw/ne/se/sw, edges n/s/e/w, rotation stem)
        const hitHandle = hitTestHandle(transformHandles, targetX, targetY, zoom, 12);
        if (hitHandle && selectedElements.length > 0) {
          if (containerRef.current) {
            containerRef.current.style.cursor = hitHandle.cursor;
          }
          return;
        }

        // 2. Check single arrow / elbow handles
        if (selectedSingleArrowOrLine && arrowHandles) {
          const arrowHandle = hitTestHandle(arrowHandles, x, y, zoom, 10);
          if (arrowHandle) {
            if (containerRef.current) {
              containerRef.current.style.cursor = "grab";
            }
            return;
          }
        }
        if (selectedElbowArrow && elbowHandles) {
          const elbowHandle = hitTestHandle(
            [...elbowHandles.endpoints, ...elbowHandles.segmentHandles], x, y, zoom, 9
          );
          if (elbowHandle) {
            if (containerRef.current) {
              containerRef.current.style.cursor = "grab";
            }
            return;
          }
        }

        // 3. Check elements under cursor (for moving)
        const hit = [...elements].reverse().find((el) => hitTestElement(el, x, y));
        if (hit) {
          if (containerRef.current) {
            containerRef.current.style.cursor = "move";
          }
          return;
        }

        // 4. Reset cursor on empty canvas
        if (containerRef.current) {
          containerRef.current.style.cursor = "";
        }
      }
      return;
    }

    if (action === "panning") {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
      return;
    }

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

    if (action === "editing-arrow-handle") {
      const handle = activeHandleRef.current;
      const orig = origElementsRef.current[0];
      const dx = snap(x - dragStartRef.current.x);
      const dy = snap(y - dragStartRef.current.y);

      let updated = { ...orig };
      if (handle.kind === "start" || handle.kind === "end") {
        let rawTargetX = handle.kind === "start" ? orig.x + dx : (orig.x2 ?? orig.x) + dx;
        let rawTargetY = handle.kind === "start" ? orig.y + dy : (orig.y2 ?? orig.y) + dy;
        let binding = null;

        if (bindElements) {
          const snapB = findBestShapeBinding(rawTargetX, rawTargetY, elements, orig.id);
          if (snapB) {
            rawTargetX = snapB.x;
            rawTargetY = snapB.y;
            binding = { elementId: snapB.elementId, anchorId: snapB.anchorId };
            setBindingSnapIndicator(snapB);
          } else {
            setBindingSnapIndicator(null);
          }
        } else {
          setBindingSnapIndicator(null);
        }

        if (handle.kind === "start") {
          updated.x = rawTargetX;
          updated.y = rawTargetY;
          updated.startBinding = binding;
        } else {
          updated.x2 = rawTargetX;
          updated.y2 = rawTargetY;
          updated.endBinding = binding;
        }
        if (updated.arrowType === "elbow") delete updated.elbowPoints;
      } else if (handle.kind === "curve") {
        const origControl = getCurvedArrowControlPoint(orig);
        updated.curveControl = {
          x: snap(origControl.cx + dx),
          y: snap(origControl.cy + dy),
        };
      }

      setElements(elements.map((el) => (el.id === orig.id ? updated : el)));
      return;
    }

    if (action === "rotating") {
      const { cx, cy, startAngle } = dragStartRef.current;
      const currentAngle = Math.atan2(y - cy, x - cx);
      let diff = currentAngle - startAngle;

      if (e.shiftKey) {
        const step = Math.PI / 12; // 15 degree snapping
        diff = Math.round(diff / step) * step;
      }

      const origMap = new Map(origElementsRef.current.map((el) => [el.id, el]));
      const next = elements.map((el) => {
        const orig = origMap.get(el.id);
        if (orig && !orig.locked) {
          return { ...orig, angle: (orig.angle || 0) + diff };
        }
        return el;
      });
      setElements(next);
      if (containerRef.current) containerRef.current.style.cursor = "grabbing";
      return;
    }

    if (action === "moving") {
      const dx = snap(x - dragStartRef.current.x);
      const dy = snap(y - dragStartRef.current.y);

      const origMap = new Map(origElementsRef.current.map((el) => [el.id, el]));
      let next = elements.map((el) => {
        const orig = origMap.get(el.id);
        if (orig && !orig.locked) {
          return translateElement(orig, dx, dy);
        }
        return el;
      });

      if (bindElements) {
        next = updateConnectedArrows(next, origMap);
      }

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

          if (orig.type === TOOLS.TEXT) {
            // Text content scales along with its bounding box. Using the
            // average axis scale keeps a one-direction resize readable while
            // still matching the font to the box's overall new size.
            const fontScale = Math.max(0.3, (scaleX + scaleY) / 2);
            return {
              ...orig,
              x: newMinX + relX,
              y: newMinY + relY,
              width: newW,
              height: newH,
              fontSize: Math.max(8, (orig.fontSize || 22) * fontScale),
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

    if (action === "editing-elbow-point" || action === "editing-elbow-segment") {
      const original = origElementsRef.current[0];
      const handle = activeHandleRef.current;
      if (!original || !handle) return;
      const originalPoints = getElbowArrowPoints(original);
      let elbowPoints = originalPoints.map((point) => ({ ...point }));

      if (action === "editing-elbow-segment") {
        const segIdx = handle.index;
        const p1 = originalPoints[segIdx];
        const p2 = originalPoints[segIdx + 1];
        if (p1 && p2) {
          const isHoriz = Math.abs(p1.y - p2.y) <= Math.abs(p1.x - p2.x);
          const dx = snap(x - dragStartRef.current.x);
          const dy = snap(y - dragStartRef.current.y);

          const isLastSegment = segIdx === originalPoints.length - 2;
          const isFirstSegment = segIdx === 0;

          if (isLastSegment) {
            // Dragging the final segment leading to end point
            if (isHoriz) {
              const newY = p1.y + dy;
              if (Math.abs(newY - p2.y) > 2) {
                elbowPoints = [
                  ...originalPoints.slice(0, segIdx),
                  { x: p1.x, y: newY },
                  { x: p2.x, y: newY },
                  { ...p2 },
                ];
              } else {
                elbowPoints[segIdx].y = newY;
                elbowPoints[segIdx + 1].y = newY;
              }
            } else {
              const newX = p1.x + dx;
              if (Math.abs(newX - p2.x) > 2) {
                elbowPoints = [
                  ...originalPoints.slice(0, segIdx),
                  { x: newX, y: p1.y },
                  { x: newX, y: p2.y },
                  { ...p2 },
                ];
              } else {
                elbowPoints[segIdx].x = newX;
                elbowPoints[segIdx + 1].x = newX;
              }
            }
          } else if (isFirstSegment && originalPoints.length > 2) {
            // Dragging the first segment leaving start point
            if (isHoriz) {
              const newY = p1.y + dy;
              if (Math.abs(newY - p1.y) > 2) {
                elbowPoints = [
                  { ...p1 },
                  { x: p1.x, y: newY },
                  { x: p2.x, y: newY },
                  ...originalPoints.slice(segIdx + 2),
                ];
              } else {
                elbowPoints[segIdx].y = newY;
                elbowPoints[segIdx + 1].y = newY;
              }
            } else {
              const newX = p1.x + dx;
              if (Math.abs(newX - p1.x) > 2) {
                elbowPoints = [
                  { ...p1 },
                  { x: newX, y: p1.y },
                  { x: newX, y: p2.y },
                  ...originalPoints.slice(segIdx + 2),
                ];
              } else {
                elbowPoints[segIdx].x = newX;
                elbowPoints[segIdx + 1].x = newX;
              }
            }
          } else {
            // Middle segment: translate segment orthogonally
            if (isHoriz) {
              elbowPoints[segIdx].y = p1.y + dy;
              elbowPoints[segIdx + 1].y = p2.y + dy;
            } else {
              elbowPoints[segIdx].x = p1.x + dx;
              elbowPoints[segIdx + 1].x = p2.x + dx;
            }
          }
        }
      } else {
        const pointIndex = handle.index;
        const target = originalPoints[pointIndex];
        const previous = originalPoints[pointIndex - 1];
        const next = originalPoints[pointIndex + 1];
        const moved = { x: snap(x), y: snap(y) };

        if (pointIndex === 0) {
          elbowPoints[0] = moved;
          if (next) {
            const isHoriz = Math.abs(target.y - next.y) <= Math.abs(target.x - next.x);
            if (isHoriz) elbowPoints[1].y = moved.y;
            else elbowPoints[1].x = moved.x;
          }
        } else if (pointIndex === elbowPoints.length - 1) {
          elbowPoints[elbowPoints.length - 1] = moved;
          if (previous) {
            const isHoriz = Math.abs(target.y - previous.y) <= Math.abs(target.x - previous.x);
            if (isHoriz) elbowPoints[elbowPoints.length - 2].y = moved.y;
            else elbowPoints[elbowPoints.length - 2].x = moved.x;
          }
        }
      }

      const first = elbowPoints[0];
      const last = elbowPoints[elbowPoints.length - 1];
      setElements(elements.map((el) => el.id === original.id
        ? { ...original, x: first.x, y: first.y, x2: last.x, y2: last.y, elbowPoints }
        : el));
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
        let finalX2 = curX;
        let finalY2 = curY;
        let endBinding = null;

        if (bindElements) {
          const endSnap = findBestShapeBinding(curX, curY, elements, draftElement.id);
          if (endSnap) {
            finalX2 = endSnap.x;
            finalY2 = endSnap.y;
            endBinding = { elementId: endSnap.elementId, anchorId: endSnap.anchorId };
            setBindingSnapIndicator(endSnap);
          } else {
            setBindingSnapIndicator(null);
          }
        } else {
          setBindingSnapIndicator(null);
        }

        setDraftElement({
          ...draftElement,
          x2: finalX2,
          y2: finalY2,
          endBinding,
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
    } else if (action === "moving" || action === "resizing" || action === "editing-elbow-point" || action === "editing-elbow-segment" || action === "editing-arrow-handle") {
      updateElements(elements);
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "";
    }
    setBindingSnapIndicator(null);
    setAction("none");
    setMarquee(null);
  };

  // Wheel handler for zoom & pan
  const handleWheel = (e) => {
    // Don't pan/zoom if scrolling inside a floating UI panel
    const isOnPanel = e.target.closest?.('.wb-style-panel, .wb-arrow-tool-panel, .wb-topbar, .wb-top-left-menu, .wb-bottom-left-dock, .wb-minimap, .wb-modal-overlay');
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

      // Enter to edit text label on selected shape or arrow
      if (e.key === "Enter" && selectedIds.length === 1) {
        e.preventDefault();
        setEditingTextId(selectedIds[0]);
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
      className={`wb-container ${tool === TOOLS.HAND || action === "panning" ? "is-panning" : ""} ${showStylePanel || showArrowToolPanel || showTextToolPanel ? "has-style-panel" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
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
        onOpenLibrary={() => setShowLibraryModal(true)}
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

      {/* Text defaults stay visible while the Text (T) tool is active. */}
      {showTextToolPanel && (
        <StylePanel
          selectedElements={[]}
          isToolDefaults
          currentStyle={currentStyle}
          onStyleChange={handleStyleChange}
        />
      )}

      {/* Arrow properties replace the common panel for new and selected arrows. */}
      {showArrowToolPanel && (
        <ArrowToolPanel
          currentStyle={arrowPanelStyle}
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
          const b = getElementBounds(el);
          const cx = b.x + b.width / 2;
          const cy = b.y + b.height / 2;
          const rotDeg = el.angle ? (el.angle * 180) / Math.PI : 0;
          const transform = rotDeg ? `rotate(${rotDeg} ${cx} ${cy})` : undefined;

          if (el.type === "text") {
            const isEditing = editingTextId === el.id;
            const isCode = Boolean(el.fontFamily && (el.fontFamily.includes("JetBrains Mono") || el.fontFamily.includes("Fira Code") || el.fontFamily.includes("Space Mono")));
            if (isCode) {
              return (
                <foreignObject
                  key={el.id}
                  x={b.x}
                  y={b.y}
                  width={Math.max(b.width, 120)}
                  height={Math.max(b.height, (el.fontSize || 22) * 1.5)}
                  opacity={opacity}
                  transform={transform}
                  style={{ display: isEditing ? "none" : "block", pointerEvents: "none" }}
                >
                  <div xmlns="http://www.w3.org/1999/xhtml" className="wb-code-block">
                    <pre style={{ fontSize: `${el.fontSize || 22}px` }}><code
                      className={`hljs language-${el.codeLanguage || "javascript"}`}
                      dangerouslySetInnerHTML={{ __html: getHighlightedCode(el.text, el.codeLanguage) }}
                    /></pre>
                  </div>
                </foreignObject>
              );
            }
            return (
              <g key={el.id} opacity={opacity} transform={transform} onDoubleClick={() => setEditingTextId(el.id)}>
                <text
                  x={el.textAlign === "center" ? b.x + b.width / 2 : el.textAlign === "right" ? b.x + b.width : b.x}
                  y={b.y + (el.fontSize || 22)}
                  fontFamily={el.fontFamily || "'Caveat', cursive"}
                  fontSize={`${el.fontSize || 22}px`}
                  fill={el.strokeColor || "#1e1e1e"}
                  textAnchor={el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start"}
                  fontWeight={el.fontWeight || "normal"}
                  fontStyle={el.fontStyle || "normal"}
                  textDecoration={el.textDecoration || "none"}
                  style={{ userSelect: "none", cursor: "pointer", display: isEditing ? "none" : "block" }}
                >
                  {(el.text || "").split("\n").map((line, idx) => (
                    <tspan
                      key={idx}
                      x={el.textAlign === "center" ? b.x + b.width / 2 : el.textAlign === "right" ? b.x + b.width : b.x}
                      dy={idx === 0 ? 0 : `${(el.fontSize || 22) * 1.35}px`}
                    >
                      {el.listStyle === "bullet" ? `• ${line}` : el.listStyle === "ordered" ? `${idx + 1}. ${line}` : line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          }

          if (el.type === "image") {
            return (
              <g key={el.id} opacity={opacity} transform={transform}>
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
          const hasLabel = el.type !== "text" && el.text && editingTextId !== el.id;
          const pos = hasLabel ? getLabelPosition(el) : null;
          const labelLines = hasLabel ? el.text.split("\n") : [];
          const fontSize = getNumericFontSize(el.fontSize);
          const fontFamily = el.fontFamily || "'Caveat', cursive";
          const isArrow = el.type === "arrow" || el.type === "line";

          return (
            <g key={el.id} opacity={opacity} transform={transform} onDoubleClick={() => setEditingTextId(el.id)}>
              {paths.map((p, pIdx) => (
                <path
                  key={pIdx}
                  d={p.d}
                  stroke={p.stroke || "none"}
                  strokeWidth={p.strokeWidth || 1}
                  fill={p.fill || "none"}
                  strokeDasharray={p.strokeDasharray}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {hasLabel && pos && (
                <g className="wb-shape-label" style={{ pointerEvents: "none" }}>
                  {isArrow && (
                    <rect
                      x={pos.x - (Math.max(...labelLines.map((l) => l.length)) * fontSize * 0.3 + 6)}
                      y={pos.y - (labelLines.length * fontSize * 0.6 + 4)}
                      width={Math.max(...labelLines.map((l) => l.length)) * fontSize * 0.6 + 12}
                      height={labelLines.length * fontSize * 1.2 + 8}
                      fill={theme === "dark" ? "#121212" : "#ffffff"}
                      rx={4}
                      opacity={0.92}
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    fontFamily={fontFamily}
                    fontSize={`${fontSize}px`}
                    fill={el.strokeColor || "#1e1e1e"}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight={el.fontWeight || "normal"}
                    fontStyle={el.fontStyle || "normal"}
                    style={{ userSelect: "none" }}
                  >
                    {labelLines.map((line, idx) => (
                      <tspan
                        key={idx}
                        x={pos.x}
                        dy={idx === 0 ? `-${(labelLines.length - 1) * fontSize * 0.6}px` : `${fontSize * 1.2}px`}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )}
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
                strokeDasharray={p.strokeDasharray}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        )}

        {/* Selection Bounding Box & Transform Handles (Styled in Excalidraw purple) */}
        {selectionBounds && selectedElements.length > 0 && action !== "drawing" && !selectedElbowArrow && !editingTextId && (
          <g
            className="wb-selection-overlay"
            transform={(() => {
              const rot = selectedElements.length === 1 ? (selectedElements[0].angle || 0) : 0;
              const deg = (rot * 180) / Math.PI;
              const cx = selectionBounds.minX + selectionBounds.width / 2;
              const cy = selectionBounds.minY + selectionBounds.height / 2;
              return deg ? `rotate(${deg} ${cx} ${cy})` : undefined;
            })()}
          >
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

        {/* Handles for Curved / Straight Arrows & Lines */}
        {selectedSingleArrowOrLine && arrowHandles && action !== "drawing" && (
          <g className="wb-arrow-handles">
            {selectedSingleArrowOrLine.arrowType === "curved" && (
              (() => {
                const { cx, cy } = getCurvedArrowControlPoint(selectedSingleArrowOrLine);
                const x1 = selectedSingleArrowOrLine.x;
                const y1 = selectedSingleArrowOrLine.y;
                const x2 = selectedSingleArrowOrLine.x2 ?? (x1 + (selectedSingleArrowOrLine.width || 0));
                const y2 = selectedSingleArrowOrLine.y2 ?? (y1 + (selectedSingleArrowOrLine.height || 0));
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                return (
                  <line
                    x1={midX}
                    y1={midY}
                    x2={cx}
                    y2={cy}
                    stroke="#a78bfa"
                    strokeWidth={1 / zoom}
                    strokeDasharray={`${3 / zoom}, ${3 / zoom}`}
                  />
                );
              })()
            )}
            {arrowHandles.map((handle) => (
              <circle
                key={handle.id}
                cx={handle.x}
                cy={handle.y}
                r={handle.kind === "curve" ? 6 / zoom : 5 / zoom}
                fill={handle.kind === "curve" ? "#6965db" : "#ffffff"}
                stroke="#6965db"
                strokeWidth={1.5 / zoom}
                style={{ cursor: "grab" }}
              >
                {handle.kind === "curve" && <title>Drag to adjust curve radius / bend</title>}
              </circle>
            ))}
          </g>
        )}

        {/* Connection Anchor Snap Indicator */}
        {bindingSnapIndicator && (
          <g className="wb-binding-indicator">
            <circle
              cx={bindingSnapIndicator.x}
              cy={bindingSnapIndicator.y}
              r={10 / zoom}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3b82f6"
              strokeWidth={2 / zoom}
            />
            <circle
              cx={bindingSnapIndicator.x}
              cy={bindingSnapIndicator.y}
              r={3.5 / zoom}
              fill="#3b82f6"
            />
          </g>
        )}

        {/* Hollow circles move existing route points. Drag a filled midpoint
            perpendicular to its edge to create a new elbow. */}
        {selectedElbowArrow && elbowHandles && action !== "drawing" && (
          <g className="wb-elbow-handles">
            {elbowHandles.endpoints.map((handle) => (
              <circle
                key={handle.id}
                cx={handle.x}
                cy={handle.y}
                r={5 / zoom}
                fill="#ffffff"
                stroke="#6965db"
                strokeWidth={1.5 / zoom}
                style={{ cursor: "grab" }}
              />
            ))}
            {elbowHandles.segmentHandles.map((handle) => (
              <circle
                key={handle.id}
                cx={handle.x}
                cy={handle.y}
                r={5 / zoom}
                fill="#a78bfa"
                fillOpacity="0.72"
                style={{ cursor: "grab" }}
              >
                <title>Drag perpendicular to this edge to add an elbow.</title>
              </circle>
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
        const isShapeOrArrow = el.type !== "text";
        const pos = isShapeOrArrow ? getLabelPosition(el) : { x: b.x, y: b.y };

        const editorWidth = isShapeOrArrow
          ? Math.max(140, (b.width || 140) * 0.8 * zoom)
          : Math.max(200, b.width * zoom);
        const screenX = isShapeOrArrow
          ? pan.x + pos.x * zoom - editorWidth / 2
          : pan.x + b.x * zoom;
        const screenY = isShapeOrArrow
          ? pan.y + pos.y * zoom - 18 * zoom
          : pan.y + b.y * zoom;

        return (
          <textarea
            autoFocus
            className="wb-inline-text-editor"
            style={{
              left: screenX,
              top: screenY,
              width: editorWidth,
              minHeight: getNumericFontSize(el.fontSize) * zoom * 1.5,
              fontSize: `${getNumericFontSize(el.fontSize) * zoom}px`,
              fontFamily: el.fontFamily || "'Caveat', cursive",
              color: el.strokeColor || "#1e1e1e",
              textAlign: isShapeOrArrow ? "center" : (el.textAlign || "left"),
            }}
            value={el.text || ""}
            placeholder="Type here…"
            onChange={(changeEvt) => {
              const text = changeEvt.target.value;
              if (!isShapeOrArrow) {
                const lines = text.split("\n");
                const maxLineLen = Math.max(...lines.map((l) => l.length), 5);
                const charWidth = (el.fontSize || 22) * 0.6;
                const nextWidth = Math.max(120, maxLineLen * charWidth);
                const nextHeight = Math.max(
                  (el.fontSize || 22) * 1.5,
                  lines.length * (el.fontSize || 22) * 1.4
                );
                setElements(elements.map((item) =>
                  item.id === el.id ? { ...item, text, width: nextWidth, height: nextHeight } : item
                ));
              } else {
                setElements(elements.map((item) =>
                  item.id === el.id ? { ...item, text } : item
                ));
              }
            }}
            onBlur={() => {
              const currentEl = elements.find((item) => item.id === el.id);
              if (currentEl?.type === "text" && (!currentEl.text || currentEl.text.trim() === "")) {
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
              kEvt.stopPropagation();
              if (kEvt.key === "Escape") {
                const currentEl = elements.find((item) => item.id === el.id);
                if (currentEl?.type === "text" && (!currentEl.text || currentEl.text.trim() === "")) {
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

      {/* Excalidraw Shape Library Modal */}
      {showLibraryModal && (
        <LibraryModal
          onInsertElements={handleInsertLibraryElements}
          onClose={() => setShowLibraryModal(false)}
        />
      )}
    </div>
  );
}
