import {
  MousePointer2, Pencil, Square, Circle, Minus, MoveUpRight, Type,
} from "lucide-react";

export const TOOLS = [
  { id: "select", icon: MousePointer2, label: "Select / move" },
  { id: "pen", icon: Pencil, label: "Freehand" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "ellipse", icon: Circle, label: "Ellipse" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "arrow", icon: MoveUpRight, label: "Arrow" },
  { id: "text", icon: Type, label: "Text" },
];

export const COLORS = ["#0f172a", "#d97706", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
export const WIDTHS = [2, 4, 7];

let idc = 0;
export const uid = () => `s${Date.now().toString(36)}${idc++}`;

// Renders one shape as SVG.
export function ShapeEl({ s, selected, onPointerDown }) {
  const common = {
    stroke: s.color,
    strokeWidth: s.width,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    onPointerDown,
    style: { cursor: onPointerDown ? "move" : "default" },
  };
  const halo = selected ? { filter: "drop-shadow(0 0 0 2px #d97706)" } : {};

  switch (s.type) {
    case "rectangle":
      return <rect x={Math.min(s.x, s.x + s.w)} y={Math.min(s.y, s.y + s.h)}
        width={Math.abs(s.w)} height={Math.abs(s.h)} rx="4" {...common} {...halo} />;
    case "ellipse":
      return <ellipse cx={s.x + s.w / 2} cy={s.y + s.h / 2}
        rx={Math.abs(s.w / 2)} ry={Math.abs(s.h / 2)} {...common} {...halo} />;
    case "line":
      return <line x1={s.x} y1={s.y} x2={s.x2} y2={s.y2} {...common} {...halo} />;
    case "arrow": {
      const angle = Math.atan2(s.y2 - s.y, s.x2 - s.x);
      const len = 10 + s.width * 1.5;
      const a1 = angle - Math.PI / 7;
      const a2 = angle + Math.PI / 7;
      return (
        <g {...halo}>
          <line x1={s.x} y1={s.y} x2={s.x2} y2={s.y2} {...common} />
          <polyline
            points={`${s.x2 - len * Math.cos(a1)},${s.y2 - len * Math.sin(a1)} ${s.x2},${s.y2} ${s.x2 - len * Math.cos(a2)},${s.y2 - len * Math.sin(a2)}`}
            {...common}
          />
        </g>
      );
    }
    case "pen":
      return <polyline points={s.points.map((p) => p.join(",")).join(" ")} {...common} {...halo} />;
    case "text":
      return (
        <text x={s.x} y={s.y} fill={s.color} fontSize={s.size}
          fontFamily="Inter, sans-serif" fontWeight="600"
          onPointerDown={onPointerDown}
          style={{ cursor: onPointerDown ? "move" : "default", userSelect: "none" }} {...halo}>
          {s.text}
        </text>
      );
    default:
      return null;
  }
}

// Returns a copy of a shape translated by (dx, dy).
export function translate(s, dx, dy) {
  switch (s.type) {
    case "rectangle":
    case "ellipse":
    case "text":
      return { ...s, x: s.x + dx, y: s.y + dy };
    case "line":
    case "arrow":
      return { ...s, x: s.x + dx, y: s.y + dy, x2: s.x2 + dx, y2: s.y2 + dy };
    case "pen":
      return { ...s, points: s.points.map(([px, py]) => [px + dx, py + dy]) };
    default:
      return s;
  }
}
