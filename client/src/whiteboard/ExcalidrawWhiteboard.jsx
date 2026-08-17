import { useCallback, useEffect, useRef } from "react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

function isExcalidrawElement(element) {
  return element && typeof element === "object" && typeof element.version === "number";
}

function toExcalidrawSkeleton(element) {
  const strokeColor = element.strokeColor || "#1e1e1e";
  const common = {
    id: element.id,
    x: element.x || 0,
    y: element.y || 0,
    strokeColor,
    backgroundColor: element.backgroundColor || "transparent",
    fillStyle: element.fillStyle || "hachure",
    strokeWidth: element.strokeWidth || 2,
    strokeStyle: element.strokeStyle || "solid",
    roughness: element.roughness ?? 1,
    opacity: element.opacity ?? 100,
  };

  if (["rectangle", "diamond", "ellipse"].includes(element.type)) {
    return {
      ...common,
      type: element.type,
      width: Math.abs(element.width || 1),
      height: Math.abs(element.height || 1),
      roundness: element.roundness ? { type: 3 } : null,
    };
  }

  if (element.type === "line" || element.type === "arrow") {
    const endX = element.x2 ?? (element.x + (element.width || 0));
    const endY = element.y2 ?? (element.y + (element.height || 0));
    return {
      ...common,
      type: element.type,
      points: [[0, 0], [endX - element.x, endY - element.y]],
      startArrowhead: element.startArrowhead || null,
      endArrowhead: element.type === "arrow" ? (element.endArrowhead || "arrow") : null,
    };
  }

  if (element.type === "pen") {
    return {
      ...common,
      type: "freedraw",
      points: element.points || [[0, 0]],
      simulatePressure: true,
    };
  }

  if (element.type === "text") {
    return {
      ...common,
      type: "text",
      text: element.text || "",
      fontSize: element.fontSize || 20,
      fontFamily: 1,
      textAlign: element.textAlign || "left",
    };
  }

  return null;
}

function getInitialElements(elements) {
  if (!Array.isArray(elements) || elements.length === 0) return [];
  if (elements.every(isExcalidrawElement)) return elements;
  const skeletons = elements.map(toExcalidrawSkeleton).filter(Boolean);
  return convertToExcalidrawElements(skeletons, { regenerateIds: false });
}

export default function ExcalidrawWhiteboard({ initialElements = [], onChange, noteTitle, theme }) {
  // Excalidraw treats initialData as a one-time scene initializer. Keeping it
  // stable avoids reinitializing the editor whenever its onChange callback
  // persists an edit to the parent note state.
  const initialDataRef = useRef(null);
  if (initialDataRef.current === null) {
    initialDataRef.current = {
      elements: getInitialElements(initialElements),
      appState: {
        viewBackgroundColor: theme === "dark" ? "#121212" : "#ffffff",
      },
    };
  }

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange = useCallback((nextElements) => {
    onChangeRef.current?.(nextElements);
  }, []);

  return (
    <div className="excalidraw-whiteboard">
      <Excalidraw
        initialData={initialDataRef.current}
        name={noteTitle}
        theme={theme === "dark" ? "dark" : "light"}
        onChange={handleChange}
        UIOptions={{ canvasActions: { loadScene: true, saveToActiveFile: true, export: {} } }}
      />
    </div>
  );
}
