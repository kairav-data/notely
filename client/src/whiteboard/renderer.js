import rough from "roughjs/bin/rough";
import { getElbowArrowPoints, getCurvedArrowControlPoint } from "./geometry.js";

const generator = rough.generator();

/**
 * Converts a roughjs drawable object into SVG path data elements.
 * Handles all set types: "path" (stroke), "fillPath" and "fillSketch" (fill patterns).
 */
function drawableToPaths(drawable) {
  if (!drawable || !drawable.sets) return [];
  const paths = [];
  const { stroke, strokeWidth, fill, strokeLineDash } = drawable.options || {};
  const strokeDasharray = Array.isArray(strokeLineDash) && strokeLineDash.length > 0
    ? strokeLineDash.join(" ")
    : undefined;

  for (const set of drawable.sets) {
    let d = "";

    if (set.type === "path" || set.type === "fillPath" || set.type === "fillSketch") {
      for (const op of set.ops) {
        switch (op.op) {
          case "move":
            d += `M${op.data[0].toFixed(3)} ${op.data[1].toFixed(3)} `;
            break;
          case "bcurveTo":
            d += `C${op.data[0].toFixed(3)} ${op.data[1].toFixed(3)}, ${op.data[2].toFixed(3)} ${op.data[3].toFixed(3)}, ${op.data[4].toFixed(3)} ${op.data[5].toFixed(3)} `;
            break;
          case "lineTo":
            d += `L${op.data[0].toFixed(3)} ${op.data[1].toFixed(3)} `;
            break;
          default:
            break;
        }
      }
    }

    if (!d) continue;

    const isFill = set.type === "fillPath" || set.type === "fillSketch";

    if (isFill) {
      // Fill sets carry the fill color and no stroke
      paths.push({
        d,
        stroke: set.type === "fillSketch" ? fill || "none" : "none",
        strokeWidth: set.type === "fillSketch" ? (drawable.options.fillWeight || 1) : 0,
        fill: set.type === "fillPath" ? (fill || "none") : "none",
      });
    } else {
      // Stroke set
      paths.push({
        d,
        stroke: stroke || "#1e1e1e",
        strokeWidth: strokeWidth || 2,
        fill: "none",
        strokeDasharray,
      });
    }
  }

  return paths;
}

function getRoughOptions(el) {
  const strokeLineDash =
    el.strokeStyle === "dashed" ? [8, 8] :
    el.strokeStyle === "dotted" ? [3, 4] : undefined;

  // Keep the hand-drawn character subtle. Large roughness and bowing values
  // make RoughJS' second pass visibly split away from the first at corners.
  // Older boards stored 1.5 for the former Artist setting, so normalize that
  // value too when they are reopened.
  const savedRoughness = el.roughness ?? 0.95;
  const roughness = savedRoughness === 1.5 ? 0.95 : savedRoughness;
  const hasFill = el.backgroundColor && el.backgroundColor !== "transparent";
  const fillStyle = el.fillStyle || "hachure";

  return {
    seed: el.seed || 12345,
    roughness,
    bowing: roughness === 0 ? 0 : Math.min(0.5, roughness * 0.5),
    maxRandomnessOffset: roughness === 0 ? 0 : Math.min(1.6, Math.max(0.8, roughness)),
    preserveVertices: true,
    stroke: el.strokeColor || "#1e1e1e",
    strokeWidth: el.strokeWidth || 2.5,
    // Only pass fill when a background color is set
    fill: hasFill ? el.backgroundColor : undefined,
    fillStyle: hasFill ? fillStyle : "hachure",
    fillWeight: Math.max(1.5, (el.strokeWidth || 2.5) * 0.6),
    hachureGap: 6,
    hachureAngle: 60,
    strokeLineDash,
    // The two closely aligned passes make the chosen sloppiness visible,
    // while the restrained randomness above keeps corners connected.
    disableMultiStroke: roughness === 0,
  };
}

function getRoundedRectSvgPath(x, y, w, h, r = 20) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return (
    `M ${x + radius} ${y} ` +
    `L ${x + w - radius} ${y} ` +
    `Q ${x + w} ${y} ${x + w} ${y + radius} ` +
    `L ${x + w} ${y + h - radius} ` +
    `Q ${x + w} ${y + h} ${x + w - radius} ${y + h} ` +
    `L ${x + radius} ${y + h} ` +
    `Q ${x} ${y + h} ${x} ${y + h - radius} ` +
    `L ${x} ${y + radius} ` +
    `Q ${x} ${y} ${x + radius} ${y} Z`
  );
}

function getRoundedElbowPath(points, radius = 14) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    if (!next) {
      d += ` L ${current.x} ${current.y}`;
      continue;
    }
    const incoming = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outgoing = Math.hypot(next.x - current.x, next.y - current.y);
    if (incoming < 0.01 || outgoing < 0.01) {
      d += ` L ${current.x} ${current.y}`;
      continue;
    }
    const cornerRadius = Math.min(radius, incoming / 2, outgoing / 2);
    const before = {
      x: current.x + ((previous.x - current.x) / incoming) * cornerRadius,
      y: current.y + ((previous.y - current.y) / incoming) * cornerRadius,
    };
    const after = {
      x: current.x + ((next.x - current.x) / outgoing) * cornerRadius,
      y: current.y + ((next.y - current.y) / outgoing) * cornerRadius,
    };
    d += ` L ${before.x} ${before.y} Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }
  return d;
}

/**
 * Renders arrowhead path objects for both ends of an arrow segment.
 *
 * End arrowhead   – placed at (toX, toY), direction determined by (fromX,fromY)→(toX,toY).
 * Start arrowhead – placed at (startX, startY), direction determined by (startX,startY)→(startNextX,startNextY).
 *
 * For straight arrows startX/startY/startNextX/startNextY are the same as
 * fromX/fromY/toX/toY so no extra args are needed.  Curved and elbow arrows
 * must pass the actual first point and the next waypoint so the head lands at
 * the true start of the path rather than at the tangent-reference point.
 */
export function renderArrowheads(
  el,
  fromX, fromY,         // tangent reference for END arrowhead direction
  toX, toY,             // position of END arrowhead
  options,
  startX, startY,       // position of START arrowhead  (default: fromX, fromY)
  startNextX, startNextY // next point along path from start (for direction) (default: toX, toY)
) {
  // Resolve defaults so straight-arrow callers need no extra args
  const sX  = startX     ?? fromX;
  const sY  = startY     ?? fromY;
  const snX = startNextX ?? toX;
  const snY = startNextY ?? toY;

  const heads = [];
  // Angle of the line at the END (fromX→toX direction)
  const endAngle   = Math.atan2(toY - fromY, toX - fromX);
  // Angle of the line at the START, pointing outward (away from the path)
  const startAngle = Math.atan2(sY - snY, sX - snX); // reversed: from next back to start

  const sw     = el.strokeWidth || 2.5;
  const size   = 10 + sw * 2;
  const stroke = el.strokeColor || "#1e1e1e";

  function wingPoints(x, y, ang) {
    const a1 = ang - Math.PI / 6;
    const a2 = ang + Math.PI / 6;
    return {
      p1x: x - size * Math.cos(a1), p1y: y - size * Math.sin(a1),
      p2x: x - size * Math.cos(a2), p2y: y - size * Math.sin(a2),
    };
  }

  // ── Start arrowhead ────────────────────────────────────────────────────────
  if (el.startArrowhead === "arrow" || el.startArrowhead === "triangle") {
    const { p1x, p1y, p2x, p2y } = wingPoints(sX, sY, startAngle);
    if (el.startArrowhead === "triangle") {
      heads.push({ d: `M ${sX} ${sY} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`, stroke, strokeWidth: sw, fill: stroke });
    } else {
      heads.push({ d: `M ${p1x} ${p1y} L ${sX} ${sY} L ${p2x} ${p2y}`, stroke, strokeWidth: sw, fill: "none" });
    }
  } else if (el.startArrowhead === "dot") {
    const r  = size / 2;
    // Place dot so its outer edge touches the start point
    const cx = sX + r * Math.cos(startAngle);
    const cy = sY + r * Math.sin(startAngle);
    heads.push({
      d: `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`,
      stroke, strokeWidth: sw * 0.5, fill: stroke,
    });
  } else if (el.startArrowhead === "bar") {
    const half = size / 1.5;
    const perp1 = startAngle + Math.PI / 2;
    const perp2 = startAngle - Math.PI / 2;
    heads.push({
      d: `M ${sX + half * Math.cos(perp1)} ${sY + half * Math.sin(perp1)} L ${sX + half * Math.cos(perp2)} ${sY + half * Math.sin(perp2)}`,
      stroke, strokeWidth: sw, fill: "none",
    });
  }

  // ── End arrowhead ──────────────────────────────────────────────────────────
  if (el.endArrowhead === "arrow" || el.endArrowhead === "triangle") {
    const { p1x, p1y, p2x, p2y } = wingPoints(toX, toY, endAngle);
    if (el.endArrowhead === "triangle") {
      heads.push({ d: `M ${toX} ${toY} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`, stroke, strokeWidth: sw, fill: stroke });
    } else {
      heads.push({ d: `M ${p1x} ${p1y} L ${toX} ${toY} L ${p2x} ${p2y}`, stroke, strokeWidth: sw, fill: "none" });
    }
  } else if (el.endArrowhead === "dot") {
    const r  = size / 2;
    const cx = toX - r * Math.cos(endAngle);
    const cy = toY - r * Math.sin(endAngle);
    heads.push({
      d: `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`,
      stroke, strokeWidth: sw * 0.5, fill: stroke,
    });
  } else if (el.endArrowhead === "bar") {
    const half = size / 1.5;
    const perp1 = endAngle + Math.PI / 2;
    const perp2 = endAngle - Math.PI / 2;
    heads.push({
      d: `M ${toX + half * Math.cos(perp1)} ${toY + half * Math.sin(perp1)} L ${toX + half * Math.cos(perp2)} ${toY + half * Math.sin(perp2)}`,
      stroke, strokeWidth: sw, fill: "none",
    });
  }

  return heads;
}


/**
 * Returns rendered vector paths for an element
 */
export function getElementPaths(el) {
  if (!el) return [];
  const options = getRoughOptions(el);

  switch (el.type) {
    case "rectangle": {
      const x = Math.min(el.x, el.x + el.width);
      const y = Math.min(el.y, el.y + el.height);
      const w = Math.max(1, Math.abs(el.width));
      const h = Math.max(1, Math.abs(el.height));

      if (el.roundness) {
        const radius = Math.min(24, Math.min(w, h) * 0.22);
        const d = getRoundedRectSvgPath(x, y, w, h, radius);
        const drawable = generator.path(d, options);
        return drawableToPaths(drawable);
      }

      const drawable = generator.rectangle(x, y, w, h, options);
      return drawableToPaths(drawable);
    }
    case "diamond": {
      const x = Math.min(el.x, el.x + el.width);
      const y = Math.min(el.y, el.y + el.height);
      const w = Math.max(1, Math.abs(el.width));
      const h = Math.max(1, Math.abs(el.height));
      const cx = x + w / 2;
      const cy = y + h / 2;
      const points = [
        [cx, y],
        [x + w, cy],
        [cx, y + h],
        [x, cy],
      ];
      const drawable = generator.polygon(points, options);
      return drawableToPaths(drawable);
    }
    case "ellipse": {
      const x = Math.min(el.x, el.x + el.width);
      const y = Math.min(el.y, el.y + el.height);
      const w = Math.max(1, Math.abs(el.width));
      const h = Math.max(1, Math.abs(el.height));
      const cx = x + w / 2;
      const cy = y + h / 2;
      const drawable = generator.ellipse(cx, cy, w, h, options);
      return drawableToPaths(drawable);
    }
    case "line": {
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));
      const drawable = generator.line(x1, y1, x2, y2, options);
      return drawableToPaths(drawable);
    }
    case "arrow": {
      const x1 = el.x;
      const y1 = el.y;
      const x2 = el.x2 ?? (el.x + (el.width || 0));
      const y2 = el.y2 ?? (el.y + (el.height || 0));
      const arrowType = el.arrowType || "straight";

      if (arrowType === "curved") {
        const { cx, cy } = getCurvedArrowControlPoint(el);
        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const drawable = generator.path(d, { ...options, fill: "none" });
        const linePaths = drawableToPaths(drawable);
        const headPaths = renderArrowheads(
          el,
          cx, cy, x2, y2, options,
          x1, y1, cx, cy
        );
        return [...linePaths, ...headPaths];
      }

      if (arrowType === "elbow") {
        const points = getElbowArrowPoints(el);
        const d = getRoundedElbowPath(points);
        const drawable = generator.path(d, { ...options, fill: "none" });
        const linePaths = drawableToPaths(drawable);
        const previous = points[points.length - 2];
        const end = points[points.length - 1];
        // End tangent: last segment direction
        // Start: actual first point, direction toward second point
        const headPaths = renderArrowheads(
          el, previous.x, previous.y, end.x, end.y, options,
          points[0].x, points[0].y, points[1].x, points[1].y
        );
        return [...linePaths, ...headPaths];
      }

      // Straight (default) — fromX/toX are the actual endpoints, no extra args needed
      const drawable = generator.line(x1, y1, x2, y2, options);
      const linePaths = drawableToPaths(drawable);
      const headPaths = renderArrowheads(el, x1, y1, x2, y2, options);
      return [...linePaths, ...headPaths];
    }
    case "pen": {
      const pts = el.points || [];
      if (pts.length < 2) return [];
      const absPts = pts.map(([px, py]) => [el.x + px, el.y + py]);
      const drawable = generator.curve(absPts, { ...options, fill: undefined });
      return drawableToPaths(drawable);
    }
    default:
      return [];
  }
}
