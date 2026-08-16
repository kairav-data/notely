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
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));
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

export function hitTestElement(el, px, py, tolerance = 8) {
  if (!el) return false;
  const b = getElementBounds(el);

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
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));
      return distToSegment(px, py, x1, y1, x2, y2) <= tolerance + (el.strokeWidth || 2) + 4;
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

export function hitTestHandle(handles, px, py, zoom = 1, tolerance = 7) {
  const tol = tolerance / zoom;
  for (const h of handles) {
    if (Math.hypot(px - h.x, py - h.y) <= tol * 1.5) {
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
      };
    case "pen":
      return { ...el, x: el.x + dx, y: el.y + dy };
    default:
      return { ...el, x: el.x + dx, y: el.y + dy };
  }
}
