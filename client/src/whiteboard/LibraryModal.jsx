import { useState, useRef, useMemo } from "react";
import {
  X,
  Search,
  Upload,
  ExternalLink,
  Plus,
  Boxes,
  Check,
  FolderOpen,
  Layers,
  Workflow,
  Layout,
  Cloud,
  Server,
  BarChart3,
  User,
  Cpu,
  FormInput,
  Sparkles,
  Database,
  PenTool,
} from "lucide-react";
import { generateId } from "./types.js";
import { DOWNLOADED_LIBRARIES } from "./downloadedLibraries.js";
import { OFFICIAL_ICON_STENCILS } from "./officialIcons.js";
import { getElementPaths } from "./renderer.js";

// Built-in Pre-Designed Shape Packs (Excalidraw & Diagram Stencils)
const BUILT_IN_STENCILS = [
  {
    id: "flow-process",
    name: "Process Step",
    category: "Flowcharts",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 140,
        height: 60,
        strokeColor: "#1e1e1e",
        backgroundColor: "#eebefa",
        fillStyle: "solid",
        strokeWidth: 2,
        roundness: true,
        text: "Process Step",
        fontSize: 18,
      },
    ],
  },
  {
    id: "flow-decision",
    name: "Decision Diamond",
    category: "Flowcharts",
    elements: [
      {
        type: "diamond",
        x: 0,
        y: 0,
        width: 120,
        height: 100,
        strokeColor: "#1e1e1e",
        backgroundColor: "#fff3bf",
        fillStyle: "solid",
        strokeWidth: 2,
        text: "Decision?",
        fontSize: 16,
      },
    ],
  },
  {
    id: "flow-database",
    name: "Database Cylinder",
    category: "Flowcharts",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 110,
        height: 80,
        strokeColor: "#1e1e1e",
        backgroundColor: "#d0ebff",
        fillStyle: "solid",
        strokeWidth: 2,
        roundness: true,
        text: "Database",
        fontSize: 16,
      },
    ],
  },
  {
    id: "flow-start-end",
    name: "Start / Terminal",
    category: "Flowcharts",
    elements: [
      {
        type: "ellipse",
        x: 0,
        y: 0,
        width: 120,
        height: 55,
        strokeColor: "#1e1e1e",
        backgroundColor: "#b2f2bb",
        fillStyle: "solid",
        strokeWidth: 2,
        text: "Start / End",
        fontSize: 16,
      },
    ],
  },
  {
    id: "ui-button",
    name: "Primary Button",
    category: "UI Wireframes",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 120,
        height: 44,
        strokeColor: "#ffffff",
        backgroundColor: "#6965db",
        fillStyle: "solid",
        strokeWidth: 1.5,
        roundness: true,
        text: "Click Me",
        fontSize: 16,
      },
    ],
  },
  {
    id: "ui-input",
    name: "Text Input Field",
    category: "UI Wireframes",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 180,
        height: 42,
        strokeColor: "#adb5bd",
        backgroundColor: "#ffffff",
        fillStyle: "solid",
        strokeWidth: 1.5,
        roundness: true,
        text: "Enter value…",
        fontSize: 15,
        textAlign: "left",
      },
    ],
  },
  {
    id: "ui-card",
    name: "UI Container Card",
    category: "UI Wireframes",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 220,
        height: 130,
        strokeColor: "#ced4da",
        backgroundColor: "#ffffff",
        fillStyle: "solid",
        strokeWidth: 1.5,
        roundness: true,
        text: "Card Title\n\nContent description line 1\nContent description line 2",
        fontSize: 14,
      },
    ],
  },
  {
    id: "note-yellow",
    name: "Yellow Sticky Note",
    category: "Sticky Notes",
    elements: [
      {
        type: "rectangle",
        x: 0,
        y: 0,
        width: 130,
        height: 130,
        strokeColor: "#e67700",
        backgroundColor: "#fff3bf",
        fillStyle: "solid",
        strokeWidth: 1.5,
        text: "Sticky Note\n\n- Add your idea\n- Key takeaway",
        fontSize: 15,
      },
    ],
  },
];

// Calculate auto-fitting viewBox for stencil thumbnail previews
function getStencilViewBox(elements) {
  if (!elements || elements.length === 0) return "-10 -10 200 150";
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    const x1 = el.x || 0;
    const y1 = el.y || 0;
    const x2 = el.x2 ?? (x1 + (el.width || 100));
    const y2 = el.y2 ?? (y1 + (el.height || 60));

    minX = Math.min(minX, x1, x2);
    minY = Math.min(minY, y1, y2);
    maxX = Math.max(maxX, x1, x2);
    maxY = Math.max(maxY, y1, y2);
  });

  const w = Math.max(40, maxX - minX);
  const h = Math.max(30, maxY - minY);
  const padX = Math.max(16, w * 0.18);
  const padY = Math.max(16, h * 0.18);

  return `${minX - padX} ${minY - padY} ${w + padX * 2} ${h + padY * 2}`;
}

// Convert Excalidraw element properties to Notely format
function convertExcalidrawElement(el) {
  if (!el) return null;
  const typeMap = {
    rectangle: "rectangle",
    diamond: "diamond",
    ellipse: "ellipse",
    arrow: "arrow",
    line: "line",
    freedraw: "pen",
    text: "text",
    image: "image",
  };

  const mappedType = typeMap[el.type] || "rectangle";
  return {
    id: generateId(),
    type: mappedType,
    x: el.x || 0,
    y: el.y || 0,
    width: el.width || 100,
    height: el.height || 60,
    x2: el.x2 ?? ((el.x || 0) + (el.width || 100)),
    y2: el.y2 ?? ((el.y || 0) + (el.height || 60)),
    strokeColor: el.strokeColor || "#1e1e1e",
    backgroundColor: el.backgroundColor || "transparent",
    fillStyle: el.fillStyle || "solid",
    strokeWidth: el.strokeWidth || 1.5,
    strokeStyle: el.strokeStyle || "solid",
    roughness: el.roughness ?? 1,
    opacity: el.opacity ?? 100,
    text: el.text || "",
    fontSize: el.fontSize || 18,
    fontFamily: el.fontFamily || "'Caveat', cursive",
    angle: el.angle || 0,
    roundness: el.roundness ? true : false,
  };
}

export default function LibraryModal({ onInsertElements, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customStencils, setCustomStencils] = useState([]);
  const [insertedId, setInsertedId] = useState(null);
  const fileInputRef = useRef(null);

  const allStencils = useMemo(() => {
    return [...(OFFICIAL_ICON_STENCILS || []), ...BUILT_IN_STENCILS, ...customStencils];
  }, [customStencils]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: allStencils.length };
    allStencils.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [allStencils]);

  const categories = useMemo(() => {
    return ["All", ...Object.keys(categoryCounts).filter((c) => c !== "All")];
  }, [categoryCounts]);

  const filteredStencils = useMemo(() => {
    return allStencils.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allStencils, selectedCategory, searchQuery]);

  const categoryIcons = {
    All: Layers,
    "Charts & Analytics": BarChart3,
    "AWS Architecture": Cloud,
    "Azure Cloud": Cloud,
    "Google Cloud (GCP)": Cloud,
    "Databricks & Data Eng": Database,
    Flowcharts: Workflow,
    "UI Wireframes": Layout,
    Architecture: Server,
    "Cloud Infrastructure": Cloud,
    "Data Visualization": BarChart3,
    "Stick Figures & People": User,
    "System Design": Cpu,
    "Forms & UI Controls": FormInput,
    "UML & ER Diagrams": Database,
    "Draw.io Stencils": PenTool,
    "Awesome Icons": Sparkles,
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const data = JSON.parse(text);
        let rawItems = [];

        if (Array.isArray(data)) {
          rawItems = data;
        } else if (data.libraryItems && Array.isArray(data.libraryItems)) {
          rawItems = data.libraryItems;
        } else if (data.library && Array.isArray(data.library)) {
          rawItems = data.library;
        } else if (data.elements && Array.isArray(data.elements)) {
          rawItems = [data.elements];
        }

        const imported = rawItems.map((item, idx) => {
          const elementsArr = Array.isArray(item) ? item : (item.elements || [item]);
          const converted = elementsArr.map(convertExcalidrawElement).filter(Boolean);
          return {
            id: `imported-${Date.now()}-${idx}`,
            name: item.name || `Imported Shape ${idx + 1}`,
            category: "Custom Imported",
            elements: converted,
          };
        });

        if (imported.length > 0) {
          setCustomStencils((prev) => [...prev, ...imported]);
          setSelectedCategory("Custom Imported");
        }
      } catch (err) {
        alert("Failed to parse Excalidraw library file.");
      }
    };
    reader.readAsText(file);
  };

  const handleInsert = (stencil) => {
    if (!stencil || !stencil.elements || stencil.elements.length === 0) return;
    onInsertElements(stencil.elements);
    setInsertedId(stencil.id);
    setTimeout(() => setInsertedId(null), 1200);
  };

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div
        className="wb-modal-card wb-library-modern-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar Category Navigation */}
        <div className="wb-lib-sidebar">
          <div className="wb-lib-sidebar-header">
            <div className="wb-lib-brand-icon">
              <Boxes size={22} color="#ffffff" />
            </div>
            <div>
              <div className="wb-lib-brand-title">Shape Library</div>
              <div className="wb-lib-brand-sub">{allStencils.length} stencils</div>
            </div>
          </div>

          <div className="wb-lib-category-list">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] || Layers;
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`wb-lib-category-btn ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <Icon size={16} className="wb-lib-cat-icon" />
                  <span className="wb-lib-cat-label">{cat}</span>
                  <span className="wb-lib-cat-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Import Custom Library Button */}
          <div className="wb-lib-sidebar-footer">
            <input
              ref={fileInputRef}
              type="file"
              accept=".excalidrawlib,.json"
              onChange={handleImportFile}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="wb-lib-import-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} /> Import .excalidrawlib
            </button>
          </div>
        </div>

        {/* Right Content Main Area */}
        <div className="wb-lib-main">
          {/* Top Header Bar */}
          <div className="wb-lib-topbar">
            {/* Search Input */}
            <div className="wb-lib-search-wrapper">
              <Search size={16} className="wb-lib-search-icon" />
              <input
                type="text"
                placeholder="Search 450+ shape stencils, icons, UI components…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wb-lib-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="wb-lib-search-clear"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              className="wb-modal-close"
              onClick={onClose}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category Banner Title */}
          <div className="wb-lib-banner">
            <div>
              <h3 className="wb-lib-banner-title">{selectedCategory}</h3>
              <span className="wb-lib-banner-count">
                Showing {filteredStencils.length} shape stencils
              </span>
            </div>
          </div>

          {/* Stencil Cards Grid */}
          <div className="wb-lib-grid-container">
            {filteredStencils.length === 0 ? (
              <div className="wb-lib-empty-state">
                <FolderOpen size={42} opacity={0.4} />
                <p>No shape stencils found matching "{searchQuery}"</p>
                <button
                  type="button"
                  className="wb-lib-import-btn"
                  style={{ width: "auto", margin: "10px auto 0" }}
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="wb-lib-grid">
                {filteredStencils.map((stencil) => {
                  const isJustInserted = insertedId === stencil.id;
                  const viewBox = getStencilViewBox(stencil.elements);
                  return (
                    <div
                      key={stencil.id}
                      className={`wb-lib-card ${isJustInserted ? "is-inserted" : ""}`}
                      onClick={() => handleInsert(stencil)}
                    >
                      {/* SVG Thumbnail Preview */}
                      <div className="wb-lib-preview-box">
                        <svg viewBox={viewBox} className="wb-lib-preview-svg">
                          {stencil.elements.map((el, elIdx) => {
                            if (el.type === "image") {
                              return (
                                <g key={elIdx}>
                                  <image
                                    href={el.src}
                                    x={el.x}
                                    y={el.y}
                                    width={el.width || 70}
                                    height={el.height || 70}
                                    preserveAspectRatio="xMidYMid meet"
                                  />
                                </g>
                              );
                            }
                            const paths = getElementPaths(el);
                            return (
                              <g key={elIdx}>
                                {paths.map((p, pIdx) => (
                                  <path
                                    key={pIdx}
                                    d={p.d}
                                    stroke={p.stroke || "#1e1e1e"}
                                    strokeWidth={p.strokeWidth || 1}
                                    fill={p.fill || "none"}
                                    strokeDasharray={p.strokeDasharray}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                ))}
                                {el.text && (
                                  <text
                                    x={el.x + (el.width || 100) / 2}
                                    y={el.y + (el.height || 60) / 2}
                                    fill={el.strokeColor || "#1e1e1e"}
                                    fontSize={el.fontSize || 14}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                  >
                                    {el.text.split("\n")[0]}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Card Footer Meta */}
                      <div className="wb-lib-card-footer">
                        <div className="wb-lib-card-meta">
                          <div className="wb-lib-card-name" title={stencil.name}>
                            {stencil.name}
                          </div>
                          <div className="wb-lib-card-badge">
                            {stencil.category}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`wb-lib-add-btn ${isJustInserted ? "is-added" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsert(stencil);
                          }}
                        >
                          {isJustInserted ? <Check size={14} /> : <Plus size={14} />}
                          <span>{isJustInserted ? "Added!" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Generous bottom spacing below last shape card */}
            <div style={{ height: 80, minHeight: 80, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
