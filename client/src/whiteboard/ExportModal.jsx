import { useState, useEffect } from "react";
import { X, Download, Copy, Check, FileImage, FileCode, FileText } from "lucide-react";
import {
  generateSvgString,
  exportToPng,
  downloadFile,
  copyToClipboard,
} from "./export.js";

export default function ExportModal({ elements = [], noteTitle = "Untitled", onClose }) {
  const [background, setBackground] = useState("#ffffff");
  const [scale, setScale] = useState(2);
  const [padding, setPadding] = useState(30);
  const [copiedType, setCopiedType] = useState(null);
  const [previewSvg, setPreviewSvg] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const svg = generateSvgString(elements, { background, padding, scale: 1 });
    setPreviewSvg(svg);
  }, [elements, background, padding]);

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const blob = await exportToPng(elements, { background, scale, padding });
      const filename = `${noteTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "whiteboard"}.png`;
      downloadFile(blob, filename, "image/png");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    const svg = generateSvgString(elements, { background, padding });
    const filename = `${noteTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "whiteboard"}.svg`;
    downloadFile(svg, filename, "image/svg+xml");
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(elements, null, 2);
    const filename = `${noteTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "whiteboard"}.excalidraw.json`;
    downloadFile(json, filename, "application/json");
  };

  const handleCopy = async (format) => {
    try {
      await copyToClipboard(elements, format, { background, scale, padding });
      setCopiedType(format);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="wb-modal-overlay" onClick={onClose}>
      <div className="wb-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="wb-modal-header">
          <h3>Export Drawing</h3>
          <button type="button" className="wb-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="wb-modal-body">
          {/* Live Preview Box */}
          <div
            className="wb-export-preview"
            style={{
              backgroundColor: background === "transparent" ? "#ffffff" : background,
              backgroundImage: background === "transparent" ? "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)" : "none",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            }}
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />

          {/* Options */}
          <div className="wb-export-options">
            <div className="wb-export-option-row">
              <label>Background</label>
              <div className="wb-export-bg-options">
                {[
                  { id: "#ffffff", label: "White" },
                  { id: "#12100e", label: "Dark" },
                  { id: "transparent", label: "Transparent" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`wb-btn-option ${background === b.id ? "is-active" : ""}`}
                    onClick={() => setBackground(b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="wb-export-option-row">
              <label>Scale (PNG)</label>
              <div className="wb-export-bg-options">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`wb-btn-option ${scale === s ? "is-active" : ""}`}
                    onClick={() => setScale(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="wb-export-actions">
            <div className="wb-export-action-col">
              <h4>Download</h4>
              <div className="wb-export-btn-group">
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={handleDownloadPng}
                  disabled={isExporting}
                >
                  <FileImage size={16} /> PNG Image
                </button>
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={handleDownloadSvg}
                >
                  <FileCode size={16} /> SVG Vector
                </button>
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={handleDownloadJson}
                >
                  <FileText size={16} /> Excalidraw JSON
                </button>
              </div>
            </div>

            <div className="wb-export-action-col">
              <h4>Copy to Clipboard</h4>
              <div className="wb-export-btn-group">
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={() => handleCopy("png")}
                >
                  {copiedType === "png" ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  {copiedType === "png" ? "Copied PNG!" : "Copy PNG Image"}
                </button>
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={() => handleCopy("svg")}
                >
                  {copiedType === "svg" ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  {copiedType === "svg" ? "Copied SVG!" : "Copy SVG String"}
                </button>
                <button
                  type="button"
                  className="wb-export-btn"
                  onClick={() => handleCopy("json")}
                >
                  {copiedType === "json" ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                  {copiedType === "json" ? "Copied JSON!" : "Copy JSON"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
