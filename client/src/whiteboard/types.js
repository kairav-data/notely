export const TOOLS = {
  SELECTION: "selection",
  HAND: "hand",
  RECTANGLE: "rectangle",
  DIAMOND: "diamond",
  ELLIPSE: "ellipse",
  ARROW: "arrow",
  LINE: "line",
  PEN: "pen",
  TEXT: "text",
  IMAGE: "image",
  ERASER: "eraser",
  LASER: "laser",
};

export const FILL_STYLES = {
  HACHURE: "hachure",
  CROSS_HATCH: "cross-hatch",
  SOLID: "solid",
  DOTS: "dots",
  ZIGZAG: "zigzag",
};

export const STROKE_STYLES = {
  SOLID: "solid",
  DASHED: "dashed",
  DOTTED: "dotted",
};

export const ARROW_TYPES = {
  STRAIGHT: "straight",
  CURVED: "curved",
  ELBOW: "elbow",
};

export const ROUGHNESS_LEVELS = {
  ARCHITECT: 0,
  ARTIST: 1.5,
  CARTOONIST: 2.8,
};

export const STROKE_WIDTHS = {
  THIN: 1.5,
  MEDIUM: 2.5,
  BOLD: 4.5,
  EXTRA: 7,
};

export const FONT_FAMILIES = {
  HAND_DRAWN: "'Caveat', 'Patrick Hand', cursive",
  NORMAL: "'Inter', sans-serif",
  CODE: "'JetBrains Mono', monospace",
};

export const FONT_SIZES = {
  SMALL: 16,
  MEDIUM: 22,
  LARGE: 30,
  XLARGE: 40,
};

export const COLOR_PALETTE = {
  STROKES: [
    "#1e1e1e", // black / ink
    "#e03131", // red
    "#2f9e44", // green
    "#1971c2", // blue
    "#f08c00", // orange
    "#9c36b5", // purple
    "#868e96", // gray
    "#ffffff", // white
  ],
  BACKGROUNDS: [
    "transparent",
    "#ffc9c9", // soft red
    "#b2f2bb", // soft green
    "#a5d8ff", // soft blue
    "#ffec99", // soft yellow
    "#eebefa", // soft purple
    "#dee2e6", // soft gray
    "#ffffff", // white
  ],
};

export const DEFAULT_ELEMENT_STYLE = {
  strokeColor: "#1e1e1e",
  backgroundColor: "transparent",
  fillStyle: FILL_STYLES.HACHURE,
  strokeWidth: STROKE_WIDTHS.MEDIUM,
  strokeStyle: STROKE_STYLES.SOLID,
  roughness: ROUGHNESS_LEVELS.ARTIST,
  roundness: true,
  opacity: 100,
  fontFamily: FONT_FAMILIES.HAND_DRAWN,
  fontSize: FONT_SIZES.MEDIUM,
  textAlign: "left",
  startArrowhead: null,
  endArrowhead: "arrow", // arrow | triangle | dot | bar | null
  arrowType: "straight", // straight | curved | elbow
};

let _idCounter = 0;
export function generateId() {
  return "el_" + Date.now().toString(36) + "_" + (++_idCounter).toString(36) + Math.random().toString(36).slice(2, 6);
}
