import rough from "roughjs/bin/rough";
import { getElbowArrowPoints } from "./geometry.js";

const generator = rough.generator();

/**
 * Converts a roughjs drawable object into SVG path data elements.
 * Handles all set types: "path" (stroke), "fillPath" and "fillSketch" (fill patterns).
 */
function drawableToPaths(drawable) {
  if (!drawable || !drawable.sets) return [];
  const paths = [];
  const { stroke, strokeWidth, fill } = drawable.options;

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

export function renderArrowheads(el, fromX, fromY, toX, toY, options) {
  const heads = [];
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const sw = el.strokeWidth || 2.5;
  const size = 10 + sw * 2;
  const stroke = el.strokeColor || "#1e1e1e";

  function arrowPath(x2, y2, ang) {
    const a1 = ang - Math.PI / 6;
    const a2 = ang + Math.PI / 6;
    const p1x = x2 - size * Math.cos(a1);
    const p1y = y2 - size * Math.sin(a1);
    const p2x = x2 - size * Math.cos(a2);
    const p2y = y2 - size * Math.sin(a2);
    return { p1x, p1y, p2x, p2y };
  }

  if (el.endArrowhead === "arrow" || el.endArrowhead === "triangle") {
    const { p1x, p1y, p2x, p2y } = arrowPath(toX, toY, angle);

    if (el.endArrowhead === "triangle") {
      // Filled solid triangle
      heads.push({
        d: `M ${toX} ${toY} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`,
        stroke,
        strokeWidth: sw,
        fill: stroke,
      });
    } else {
      // Open arrow "V" shape
      heads.push({
        d: `M ${p1x} ${p1y} L ${toX} ${toY} L ${p2x} ${p2y}`,
        stroke,
        strokeWidth: sw,
        fill: "none",
      });
    }
  } else if (el.endArrowhead === "dot") {
    const r = size / 2;
    const cx = toX - r * Math.cos(angle);
    const cy = toY - r * Math.sin(angle);
    // SVG circle via arc path
    heads.push({
      d: `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`,
      stroke,
      strokeWidth: sw * 0.5,
      fill: stroke,
    });
  } else if (el.endArrowhead === "bar") {
    const a1 = angle - Math.PI / 2;
    const a2 = angle + Math.PI / 2;
    const half = size / 1.5;
    const b1x = toX + half * Math.cos(a1);
    const b1y = toY + half * Math.sin(a1);
    const b2x = toX + half * Math.cos(a2);
    const b2y = toY + half * Math.sin(a2);
    heads.push({
      d: `M ${b1x} ${b1y} L ${b2x} ${b2y}`,
      stroke,
      strokeWidth: sw,
      fill: "none",
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
        // Cubic bezier: control points hug x1 and x2 so it naturally
        // "hooks" — like the reference image curve (starts going down, then sweeps right).
        // CP1 is directly below start, CP2 is directly left of end.
        const cp1x = x1;
        const cp1y = y2;
        const cp2x = x2;
        const cp2y = y2;
        const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
        const drawable = generator.path(d, { ...options, fill: "none" });
        const linePaths = drawableToPaths(drawable);
        // Tangent at end (t=1) for cubic bezier: direction from cp2 to end
        const headPaths = renderArrowheads(el, cp2x, cp2y, x2, y2, options);
        return [...linePaths, ...headPaths];
      }

      if (arrowType === "elbow") {
        const points = getElbowArrowPoints(el);
        const d = getRoundedElbowPath(points);
        const drawable = generator.path(d, { ...options, fill: "none" });
        const linePaths = drawableToPaths(drawable);
        const previous = points[points.length - 2];
        const end = points[points.length - 1];
        const headPaths = renderArrowheads(el, previous.x, previous.y, end.x, end.y, options);
        return [...linePaths, ...headPaths];
      }

      // Straight (default)
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
