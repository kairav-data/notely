/**
 * Geometry helpers for whiteboard elements:
 * - Bounding boxes
 * - Point-in-shape hit testing
 * - Marquee intersection
 * - Transform handle math
 * - Alignment & distribution
 */

export function getElementBounds(el) {
  if (!el) return { x: 0, y: 0, width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };

  switch (el.type) {
    case "rectangle":
    case "diamond":
    case "ellipse":
    case "image":
    case "text": {
      const minX = Math.min(el.x, el.x + el.width);
      const minY = Math.min(el.y, el.y + el.height);
      const maxX = Math.max(el.x, el.x + el.width);
      const maxY = Math.max(el.y, el.y + el.height);
      return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
        minX,
        minY,
        maxX,
        maxY,
      };
    }
    case "line":
    case "arrow": {
      const route = el.type === "arrow" && el.arrowType === "elbow"
        ? getElbowArrowPoints(el)
        : null;
      if (route) {
        const xs = route.map((point) => point.x);
        const ys = route.map((point) => point.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY), minX, minY, maxX, maxY };
      }
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));
      if (el.arrowType === "curved") {
        const { cx, cy } = getCurvedArrowControlPoint(el);
        const minX = Math.min(x1, x2, cx);
        const minY = Math.min(y1, y2, cy);
        const maxX = Math.max(x1, x2, cx);
        const maxY = Math.max(y1, y2, cy);
        return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY), minX, minY, maxX, maxY };
      }
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
        minX,
        minY,
        maxX,
        maxY,
      };
    }
    case "pen": {
      const pts = el.points || [];
      if (pts.length === 0) {
        return { x: el.x, y: el.y, width: 1, height: 1, minX: el.x, minY: el.y, maxX: el.x + 1, maxY: el.y + 1 };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [px, py] of pts) {
        const absX = el.x + px;
        const absY = el.y + py;
        if (absX < minX) minX = absX;
        if (absY < minY) minY = absY;
        if (absX > maxX) maxX = absX;
        if (absY > maxY) maxY = absY;
      }
      return {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
        minX,
        minY,
        maxX,
        maxY,
      };
    }
    default:
      return { x: el.x, y: el.y, width: el.width || 10, height: el.height || 10, minX: el.x, minY: el.y, maxX: el.x + (el.width || 10), maxY: el.y + (el.height || 10) };
  }
}

// Computes or retrieves the curve control point for curved arrows
export function getCurvedArrowControlPoint(el) {
  const x1 = el.x;
  const y1 = el.y;
  const x2 = el.x2 ?? (el.x + (el.width || 0));
  const y2 = el.y2 ?? (el.y + (el.height || 0));

  if (el.curveControl && typeof el.curveControl.x === "number" && typeof el.curveControl.y === "number") {
    return { cx: el.curveControl.x, cy: el.curveControl.y };
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const offset = Math.max(25, len * 0.25);
  const nx = -dy / len;
  const ny = dx / len;
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;

  return { cx, cy };
}

export function getArrowHandles(el) {
  if (!el || (el.type !== "arrow" && el.type !== "line")) return null;
  if (el.arrowType === "elbow") return null;

  const x1 = el.x;
  const y1 = el.y;
  const x2 = el.x2 ?? (el.x + (el.width || 0));
  const y2 = el.y2 ?? (el.y + (el.height || 0));

  const handles = [
    { id: "arrow-start", kind: "start", x: x1, y: y1 },
    { id: "arrow-end", kind: "end", x: x2, y: y2 },
  ];

  if (el.arrowType === "curved") {
    const { cx, cy } = getCurvedArrowControlPoint(el);
    handles.push({ id: "arrow-curve", kind: "curve", x: cx, y: cy });
  }

  return handles;
}

// Elbow arrows retain their route as absolute points after a user adds or
// adjusts bends. Older arrows have no saved route, so derive the original
// three-segment route for backward compatibility.
export function getElbowArrowPoints(el) {
  if (!el || el.type !== "arrow" || el.arrowType !== "elbow") return null;
  if (Array.isArray(el.elbowPoints) && el.elbowPoints.length >= 2) {
    const pts = el.elbowPoints;
    const clean = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const prev = clean[clean.length - 1];
      if (Math.hypot(pts[i].x - prev.x, pts[i].y - prev.y) > 1) {
        clean.push(pts[i]);
      }
    }
    if (clean.length >= 2) return clean;
  }
  const x1 = el.x;
  const y1 = el.y;
  const x2 = el.x2 ?? (el.x + (el.width || 0));
  const y2 = el.y2 ?? (el.y + (el.height || 0));
  const dx = x2 - x1;
  const dy = y2 - y1;

  if (Math.abs(dx) < 2 || Math.abs(dy) < 2) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    const midX = (x1 + x2) / 2;
    return [
      { x: x1, y: y1 },
      { x: midX, y: y1 },
      { x: midX, y: y2 },
      { x: x2, y: y2 },
    ];
  } else {
    const midY = (y1 + y2) / 2;
    return [
      { x: x1, y: y1 },
      { x: x1, y: midY },
      { x: x2, y: midY },
      { x: x2, y: y2 },
    ];
  }
}

export function getCombinedBounds(elements) {
  if (!elements || elements.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const el of elements) {
    const b = getElementBounds(el);
    if (b.minX < minX) minX = b.minX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.maxY > maxY) maxY = b.maxY;
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    minX,
    minY,
    maxX,
    maxY,
  };
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

export function rotatePoint(px, py, cx, cy, angle) {
  if (!angle) return { x: px, y: py };
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function hitTestElement(el, px, py, tolerance = 8) {
  if (!el) return false;
  const b = getElementBounds(el);

  if (el.angle) {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const unrot = rotatePoint(px, py, cx, cy, -el.angle);
    px = unrot.x;
    py = unrot.y;
  }

  // Early bounding box check with tolerance
  if (
    px < b.minX - tolerance ||
    px > b.maxX + tolerance ||
    py < b.minY - tolerance ||
    py > b.maxY + tolerance
  ) {
    return false;
  }

  switch (el.type) {
    case "rectangle":
    case "image":
    case "text": {
      return (
        px >= b.minX - tolerance &&
        px <= b.maxX + tolerance &&
        py >= b.minY - tolerance &&
        py <= b.maxY + tolerance
      );
    }
    case "diamond": {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const rx = (b.width / 2) + tolerance;
      const ry = (b.height / 2) + tolerance;
      const normDist = Math.abs(px - cx) / (rx || 1) + Math.abs(py - cy) / (ry || 1);
      return normDist <= 1.08;
    }
    case "ellipse": {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const rx = (b.width / 2) + tolerance;
      const ry = (b.height / 2) + tolerance;
      const normDist = ((px - cx) * (px - cx)) / ((rx * rx) || 1) + ((py - cy) * (py - cy)) / ((ry * ry) || 1);
      return normDist <= 1.08;
    }
    case "line":
    case "arrow": {
      const route = el.type === "arrow" && el.arrowType === "elbow"
        ? getElbowArrowPoints(el)
        : null;
      if (route) {
        return route.some((point, index) => index > 0
          && distToSegment(px, py, route[index - 1].x, route[index - 1].y, point.x, point.y) <= tolerance + (el.strokeWidth || 2) + 6);
      }
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));

      if (el.arrowType === "curved") {
        const { cx, cy } = getCurvedArrowControlPoint(el);
        let prevX = x1;
        let prevY = y1;
        const steps = 12;
        const tol = tolerance + (el.strokeWidth || 2) + 8;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const currX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const currY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
          if (distToSegment(px, py, prevX, prevY, currX, currY) <= tol) {
            return true;
          }
          prevX = currX;
          prevY = currY;
        }
        return false;
      }

      return distToSegment(px, py, x1, y1, x2, y2) <= tolerance + (el.strokeWidth || 2) + 8;
    }
    case "pen": {
      const pts = el.points || [];
      if (pts.length < 2) return Math.hypot(px - el.x, py - el.y) <= (tolerance + 4) * 2;
      for (let i = 0; i < pts.length - 1; i++) {
        const x1 = el.x + pts[i][0];
        const y1 = el.y + pts[i][1];
        const x2 = el.x + pts[i + 1][0];
        const y2 = el.y + pts[i + 1][1];
        if (distToSegment(px, py, x1, y1, x2, y2) <= tolerance + (el.strokeWidth || 2) + 4) {
          return true;
        }
      }
      return false;
    }
    default:
      return true;
  }
}

export function isElementInBox(el, box) {
  const b = getElementBounds(el);
  const minX = Math.min(box.x, box.x + box.width);
  const minY = Math.min(box.y, box.y + box.height);
  const maxX = Math.max(box.x, box.x + box.width);
  const maxY = Math.max(box.y, box.y + box.height);

  return (
    b.minX < maxX &&
    b.maxX > minX &&
    b.minY < maxY &&
    b.maxY > minY
  );
}

export function getTransformHandles(bounds, zoom = 1) {
  if (!bounds) return [];
  const size = 8 / zoom;
  const offset = 4 / zoom;
  const { x, y, width, height } = bounds;

  return [
    { id: "nw", x: x - offset, y: y - offset, cursor: "nwse-resize" },
    { id: "n",  x: x + width / 2, y: y - offset, cursor: "ns-resize" },
    { id: "ne", x: x + width + offset, y: y - offset, cursor: "nesw-resize" },
    { id: "e",  x: x + width + offset, y: y + height / 2, cursor: "ew-resize" },
    { id: "se", x: x + width + offset, y: y + height + offset, cursor: "nwse-resize" },
    { id: "s",  x: x + width / 2, y: y + height + offset, cursor: "ns-resize" },
    { id: "sw", x: x - offset, y: y + height + offset, cursor: "nesw-resize" },
    { id: "w",  x: x - offset, y: y + height / 2, cursor: "ew-resize" },
    { id: "rotation", x: x + width / 2, y: y - 24 / zoom, cursor: "grab" },
  ];
}

export function hitTestHandle(handles, px, py, zoom = 1, tolerance = 10) {
  const tol = (tolerance / zoom) * 1.5;
  for (const h of handles) {
    if (Math.hypot(px - h.x, py - h.y) <= tol) {
      return h;
    }
  }
  return null;
}

export function alignElements(elements, type) {
  if (elements.length < 2) return elements;
  const bounds = getCombinedBounds(elements);
  if (!bounds) return elements;

  return elements.map((el) => {
    const b = getElementBounds(el);
    let dx = 0;
    let dy = 0;

    switch (type) {
      case "left":
        dx = bounds.minX - b.minX;
        break;
      case "center":
        dx = (bounds.minX + bounds.width / 2) - (b.minX + b.width / 2);
        break;
      case "right":
        dx = bounds.maxX - b.maxX;
        break;
      case "top":
        dy = bounds.minY - b.minY;
        break;
      case "middle":
        dy = (bounds.minY + bounds.height / 2) - (b.minY + b.height / 2);
        break;
      case "bottom":
        dy = bounds.maxY - b.maxY;
        break;
      default:
        break;
    }

    return translateElement(el, dx, dy);
  });
}

export function distributeElements(elements, axis) {
  if (elements.length < 3) return elements;

  const sorted = [...elements].sort((a, b) => {
    const ba = getElementBounds(a);
    const bb = getElementBounds(b);
    return axis === "horizontal" ? ba.minX - bb.minX : ba.minY - bb.minY;
  });

  const firstBounds = getElementBounds(sorted[0]);
  const lastBounds = getElementBounds(sorted[sorted.length - 1]);

  if (axis === "horizontal") {
    const totalSpan = lastBounds.maxX - firstBounds.minX;
    const totalWidths = sorted.reduce((sum, el) => sum + getElementBounds(el).width, 0);
    const gap = (totalSpan - totalWidths) / (sorted.length - 1);
    let curX = firstBounds.minX;

    return sorted.map((el) => {
      const b = getElementBounds(el);
      const dx = curX - b.minX;
      curX += b.width + gap;
      return translateElement(el, dx, 0);
    });
  } else {
    const totalSpan = lastBounds.maxY - firstBounds.minY;
    const totalHeights = sorted.reduce((sum, el) => sum + getElementBounds(el).height, 0);
    const gap = (totalSpan - totalHeights) / (sorted.length - 1);
    let curY = firstBounds.minY;

    return sorted.map((el) => {
      const b = getElementBounds(el);
      const dy = curY - b.minY;
      curY += b.height + gap;
      return translateElement(el, 0, dy);
    });
  }
}

export function translateElement(el, dx, dy) {
  if (dx === 0 && dy === 0) return el;
  switch (el.type) {
    case "rectangle":
    case "diamond":
    case "ellipse":
    case "image":
    case "text":
      return { ...el, x: el.x + dx, y: el.y + dy };
    case "line":
    case "arrow":
      return {
        ...el,
        x: el.x + dx,
        y: el.y + dy,
        x2: (el.x2 !== undefined ? el.x2 : el.x + (el.width || 0)) + dx,
        y2: (el.y2 !== undefined ? el.y2 : el.y + (el.height || 0)) + dy,
        ...(el.curveControl
          ? { curveControl: { x: el.curveControl.x + dx, y: el.curveControl.y + dy } }
          : {}),
        ...(Array.isArray(el.elbowPoints)
          ? { elbowPoints: el.elbowPoints.map((point) => ({ x: point.x + dx, y: point.y + dy })) }
          : {}),
      };
    case "pen":
      return { ...el, x: el.x + dx, y: el.y + dy };
    default:
      return { ...el, x: el.x + dx, y: el.y + dy };
  }
}

// Shape Connection / Binding Helpers (PowerPoint & Excalidraw Style)

export function getShapeAnchors(el) {
  if (!el || el.type === "arrow" || el.type === "line") return [];

  const b = getElementBounds(el);
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;

  const rawAnchors = [
    { id: "top", x: cx, y: b.y },
    { id: "bottom", x: cx, y: b.y + b.height },
    { id: "left", x: b.x, y: cy },
    { id: "right", x: b.x + b.width, y: cy },
    { id: "center", x: cx, y: cy },
  ];

  if (el.angle) {
    return rawAnchors.map((anc) => {
      const rot = rotatePoint(anc.x, anc.y, cx, cy, el.angle);
      return { ...anc, x: rot.x, y: rot.y };
    });
  }

  return rawAnchors;
}

export function findBestShapeBinding(px, py, elements, excludeId = null, maxDist = 28) {
  let best = null;
  let minDist = maxDist;

  for (const el of elements) {
    if (!el || el.id === excludeId || el.type === "arrow" || el.type === "line") continue;

    const anchors = getShapeAnchors(el);
    for (const anc of anchors) {
      const d = Math.hypot(px - anc.x, py - anc.y);
      if (d < minDist) {
        minDist = d;
        best = {
          elementId: el.id,
          anchorId: anc.id,
          x: anc.x,
          y: anc.y,
        };
      }
    }
  }

  return best;
}

export function updateConnectedArrows(elements, movedElementsMap) {
  if (!movedElementsMap || movedElementsMap.size === 0) return elements;

  const elementsMap = new Map(elements.map((el) => [el.id, el]));

  return elements.map((el) => {
    if (el.type !== "arrow" && el.type !== "line") return el;

    let updated = el;
    let changed = false;

    // Check Start Binding
    if (el.startBinding && el.startBinding.elementId) {
      const targetShape = elementsMap.get(el.startBinding.elementId);
      if (targetShape && movedElementsMap.has(targetShape.id)) {
        const anchors = getShapeAnchors(targetShape);
        const anc = anchors.find((a) => a.id === el.startBinding.anchorId) || anchors[4];
        if (anc) {
          updated = { ...updated, x: anc.x, y: anc.y };
          changed = true;
        }
      }
    }

    // Check End Binding
    if (el.endBinding && el.endBinding.elementId) {
      const targetShape = elementsMap.get(el.endBinding.elementId);
      if (targetShape && movedElementsMap.has(targetShape.id)) {
        const anchors = getShapeAnchors(targetShape);
        const anc = anchors.find((a) => a.id === el.endBinding.anchorId) || anchors[4];
        if (anc) {
          updated = { ...updated, x2: anc.x, y2: anc.y };
          changed = true;
        }
      }
    }

    if (changed && updated.arrowType === "elbow") {
      delete updated.elbowPoints;
    }

    return updated;
  });
}

export function getLabelPosition(el) {
  if (!el) return { x: 0, y: 0 };
  const b = getElementBounds(el);

  if (el.type === "arrow" || el.type === "line") {
    if (el.arrowType === "elbow") {
      const route = getElbowArrowPoints(el);
      if (route && route.length >= 2) {
        const midSegIdx = Math.floor((route.length - 2) / 2);
        const p1 = route[midSegIdx];
        const p2 = route[midSegIdx + 1];
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      }
    } else if (el.arrowType === "curved") {
      const c = getCurvedArrowControlPoint(el);
      const startX = el.x;
      const startY = el.y;
      const endX = el.x2 ?? (el.x + (el.width || 0));
      const endY = el.y2 ?? (el.y + (el.height || 0));
      return {
        x: 0.25 * startX + 0.5 * c.cx + 0.25 * endX,
        y: 0.25 * startY + 0.5 * c.cy + 0.25 * endY,
      };
    }
    const x2 = el.x2 ?? (el.x + (el.width || 0));
    const y2 = el.y2 ?? (el.y + (el.height || 0));
    return { x: (el.x + x2) / 2, y: (el.y + y2) / 2 };
  }

  return {
    x: b.x + b.width / 2,
    y: b.y + b.height / 2,
  };
}

export function getNumericFontSize(val) {
  if (typeof val === "number") return val;
  if (val === 16 || val === "S" || val === "16") return 16;
  if (val === 22 || val === "M" || val === "22") return 22;
  if (val === 30 || val === "L" || val === "30") return 30;
  if (val === 40 || val === "XL" || val === "40") return 40;
  return 20;
}
