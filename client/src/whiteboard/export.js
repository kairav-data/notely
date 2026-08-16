import { getCombinedBounds, getElementBounds } from "./geometry.js";
import { getElementPaths } from "./renderer.js";

/**
 * Generates an SVG string representation of the whiteboard elements
 */
export function generateSvgString(elements, options = {}) {
  const {
    padding = 30,
    background = "#ffffff",
    darkMode = false,
  } = options;

  if (!elements || elements.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="${background}"/><text x="200" y="150" text-anchor="middle" font-family="sans-serif" fill="#888">Empty canvas</text></svg>`;
  }

  const bounds = getCombinedBounds(elements);
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;

  let body = "";

  // Optional background
  if (background && background !== "transparent") {
    body += `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${background}"/>\n`;
  }

  for (const el of elements) {
    const opacity = (el.opacity ?? 100) / 100;
    body += `<g opacity="${opacity}">\n`;

    if (el.type === "text") {
      const b = getElementBounds(el);
      const lines = (el.text || "").split("\n");
      const fontSize = el.fontSize || 22;
      const lineHeight = fontSize * 1.35;
      const anchor = el.textAlign === "center" ? "middle" : el.textAlign === "right" ? "end" : "start";
      const startX = el.textAlign === "center" ? b.x + b.width / 2 : el.textAlign === "right" ? b.x + b.width : b.x;

      body += `<text x="${startX}" y="${b.y + fontSize}" font-family="${el.fontFamily || "'Caveat', cursive"}" font-size="${fontSize}px" fill="${el.strokeColor || '#1e1e1e'}" text-anchor="${anchor}">\n`;
      lines.forEach((line, idx) => {
        body += `<tspan x="${startX}" dy="${idx === 0 ? 0 : lineHeight}px">${escapeXml(line)}</tspan>\n`;
      });
      body += `</text>\n`;
    } else if (el.type === "image") {
      const b = getElementBounds(el);
      body += `<image href="${el.src}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" preserveAspectRatio="none"/>\n`;
    } else {
      const paths = getElementPaths(el);
      for (const p of paths) {
        body += `<path d="${p.d}" stroke="${p.stroke || "none"}" stroke-width="${p.strokeWidth || 1}" fill="${p.fill || "none"}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
      }
    }

    body += `</g>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&amp;family=Inter:wght@400;600&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap');
    text { font-weight: 500; }
  </style>
  ${body}
</svg>`;
}

function escapeXml(unsafe) {
  return (unsafe || "").replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
    }
  });
}

/**
 * Exports elements to PNG Blob
 */
export async function exportToPng(elements, options = {}) {
  const { scale = 2, background = "#ffffff" } = options;
  const svgStr = generateSvgString(elements, { ...options, background });
  const bounds = getCombinedBounds(elements) || { width: 400, height: 300 };
  const padding = options.padding || 30;
  const width = (bounds.width + padding * 2) * scale;
  const height = (bounds.height + padding * 2) * scale;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (background && background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      }, "image/png");
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Downloads a Blob or text content as a file
 */
export function downloadFile(content, filename, mimeType = "application/octet-stream") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copies elements as PNG or SVG to clipboard
 */
export async function copyToClipboard(elements, format = "png", options = {}) {
  if (format === "png") {
    const blob = await exportToPng(elements, options);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
  } else if (format === "svg") {
    const svg = generateSvgString(elements, options);
    await navigator.clipboard.writeText(svg);
  } else if (format === "json") {
    const json = JSON.stringify(elements, null, 2);
    await navigator.clipboard.writeText(json);
  }
}
