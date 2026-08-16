import { getCombinedBounds, getElementBounds } from "./geometry.js";

export default function Minimap({
  elements = [],
  pan = { x: 0, y: 0 },
  zoom = 1,
  viewportSize = { width: 800, height: 600 },
  onPanTo,
}) {
  const mapWidth = 180;
  const mapHeight = 120;

  const contentBounds = getCombinedBounds(elements) || {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
    minX: 0,
    minY: 0,
    maxX: 1000,
    maxY: 1000,
  };

  // Viewport in canvas coords
  const viewX = -pan.x / zoom;
  const viewY = -pan.y / zoom;
  const viewW = viewportSize.width / zoom;
  const viewH = viewportSize.height / zoom;

  const totalMinX = Math.min(contentBounds.minX - 200, viewX - 100);
  const totalMinY = Math.min(contentBounds.minY - 200, viewY - 100);
  const totalMaxX = Math.max(contentBounds.maxX + 200, viewX + viewW + 100);
  const totalMaxY = Math.max(contentBounds.maxY + 200, viewY + viewH + 100);

  const totalW = Math.max(1, totalMaxX - totalMinX);
  const totalH = Math.max(1, totalMaxY - totalMinY);

  const scale = Math.min(mapWidth / totalW, mapHeight / totalH);

  const toMapX = (x) => (x - totalMinX) * scale;
  const toMapY = (y) => (y - totalMinY) * scale;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetCanvasX = totalMinX + clickX / scale;
    const targetCanvasY = totalMinY + clickY / scale;

    const newPanX = -(targetCanvasX - viewW / 2) * zoom;
    const newPanY = -(targetCanvasY - viewH / 2) * zoom;

    onPanTo({ x: newPanX, y: newPanY });
  };

  return (
    <div className="wb-minimap" onClick={handleClick} title="Click to navigate canvas">
      <svg width={mapWidth} height={mapHeight}>
        {/* Render elements mini thumbnails */}
        {elements.map((el) => {
          const b = getElementBounds(el);
          return (
            <rect
              key={el.id}
              x={toMapX(b.x)}
              y={toMapY(b.y)}
              width={Math.max(2, b.width * scale)}
              height={Math.max(2, b.height * scale)}
              fill={el.strokeColor || "#888"}
              opacity="0.6"
              rx="1"
            />
          );
        })}

        {/* Viewport frame rectangle */}
        <rect
          x={toMapX(viewX)}
          y={toMapY(viewY)}
          width={Math.max(8, viewW * scale)}
          height={Math.max(8, viewH * scale)}
          fill="rgba(217, 119, 6, 0.15)"
          stroke="#d97706"
          strokeWidth="1.5"
          rx="2"
        />
      </svg>
    </div>
  );
}
