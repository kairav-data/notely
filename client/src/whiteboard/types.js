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
  ARTIST: 0.95,
  CARTOONIST: 1.8,
};

export const STROKE_WIDTHS = {
  THIN: 1.5,
  MEDIUM: 2.5,
  BOLD: 4.5,
  EXTRA: 7,
};

export const FONT_FAMILIES = {
  // Hand-drawn & Script
  CAVEAT: "'Caveat', cursive",
  ARCHITECT: "'Architects Daughter', cursive",
  PATRICK_HAND: "'Patrick Hand', cursive",
  KALAM: "'Kalam', cursive",
  INDIE_FLOWER: "'Indie Flower', cursive",
  PACIFICO: "'Pacifico', cursive",
  SHADOWS_INTO_LIGHT: "'Shadows Into Light', cursive",

  // Modern Sans-Serif
  INTER: "'Inter', sans-serif",
  POPPINS: "'Poppins', sans-serif",
  MONTSERRAT: "'Montserrat', sans-serif",
  ROBOTO: "'Roboto', sans-serif",
  OPEN_SANS: "'Open Sans', sans-serif",
  OSWALD: "'Oswald', sans-serif",

  // Serif & Editorial
  PLAYFAIR: "'Playfair Display', Georgia, serif",
  LORA: "'Lora', Georgia, serif",
  MERRIWEATHER: "'Merriweather', serif",
  GEORGIA: "Georgia, 'Times New Roman', serif",

  // Monospace & Code
  JETBRAINS_MONO: "'JetBrains Mono', monospace",
  FIRA_CODE: "'Fira Code', monospace",
  SPACE_MONO: "'Space Mono', monospace",

  // Legacy aliases
  HAND_DRAWN: "'Caveat', 'Patrick Hand', cursive",
  NORMAL: "'Inter', sans-serif",
  SERIF: "Georgia, 'Times New Roman', serif",
  CODE: "'JetBrains Mono', monospace",
};

export const FONT_FAMILY_LIST = [
  // Handwritten
  { id: FONT_FAMILIES.CAVEAT, label: "Caveat", category: "Handwritten", fontCss: "'Caveat', cursive" },
  { id: FONT_FAMILIES.ARCHITECT, label: "Architects Daughter", category: "Handwritten", fontCss: "'Architects Daughter', cursive" },
  { id: FONT_FAMILIES.PATRICK_HAND, label: "Patrick Hand", category: "Handwritten", fontCss: "'Patrick Hand', cursive" },
  { id: FONT_FAMILIES.KALAM, label: "Kalam (Marker)", category: "Handwritten", fontCss: "'Kalam', cursive" },
  { id: FONT_FAMILIES.INDIE_FLOWER, label: "Indie Flower", category: "Handwritten", fontCss: "'Indie Flower', cursive" },
  { id: FONT_FAMILIES.PACIFICO, label: "Pacifico (Brush)", category: "Handwritten", fontCss: "'Pacifico', cursive" },
  { id: FONT_FAMILIES.SHADOWS_INTO_LIGHT, label: "Shadows Into Light", category: "Handwritten", fontCss: "'Shadows Into Light', cursive" },

  // Sans-Serif
  { id: FONT_FAMILIES.INTER, label: "Inter (Modern)", category: "Sans-Serif", fontCss: "'Inter', sans-serif" },
  { id: FONT_FAMILIES.POPPINS, label: "Poppins (Clean)", category: "Sans-Serif", fontCss: "'Poppins', sans-serif" },
  { id: FONT_FAMILIES.MONTSERRAT, label: "Montserrat", category: "Sans-Serif", fontCss: "'Montserrat', sans-serif" },
  { id: FONT_FAMILIES.ROBOTO, label: "Roboto", category: "Sans-Serif", fontCss: "'Roboto', sans-serif" },
  { id: FONT_FAMILIES.OPEN_SANS, label: "Open Sans", category: "Sans-Serif", fontCss: "'Open Sans', sans-serif" },
  { id: FONT_FAMILIES.OSWALD, label: "Oswald (Bold)", category: "Sans-Serif", fontCss: "'Oswald', sans-serif" },

  // Serif
  { id: FONT_FAMILIES.PLAYFAIR, label: "Playfair Display", category: "Serif", fontCss: "'Playfair Display', serif" },
  { id: FONT_FAMILIES.LORA, label: "Lora (Book)", category: "Serif", fontCss: "'Lora', serif" },
  { id: FONT_FAMILIES.MERRIWEATHER, label: "Merriweather", category: "Serif", fontCss: "'Merriweather', serif" },
  { id: FONT_FAMILIES.GEORGIA, label: "Georgia", category: "Serif", fontCss: "Georgia, serif" },

  // Monospace
  { id: FONT_FAMILIES.JETBRAINS_MONO, label: "JetBrains Mono", category: "Monospace", fontCss: "'JetBrains Mono', monospace" },
  { id: FONT_FAMILIES.FIRA_CODE, label: "Fira Code", category: "Monospace", fontCss: "'Fira Code', monospace" },
  { id: FONT_FAMILIES.SPACE_MONO, label: "Space Mono", category: "Monospace", fontCss: "'Space Mono', monospace" },
];

export const FONT_SIZES = {
  SMALL: 16,
  MEDIUM: 22,
  LARGE: 30,
  XLARGE: 40,
};

export const CODE_LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "cpp", label: "C++" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "sql", label: "SQL" },
  { id: "bash", label: "Bash" },
];

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
  fontWeight: "normal",
  fontStyle: "normal",
  textDecoration: "none",
  listStyle: "none",
  codeLanguage: "javascript",
  startArrowhead: null,
  endArrowhead: "arrow", // arrow | triangle | dot | bar | null
  arrowType: "straight", // straight | curved | elbow
};

let _idCounter = 0;
export function generateId() {
  return "el_" + Date.now().toString(36) + "_" + (++_idCounter).toString(36) + Math.random().toString(36).slice(2, 6);
}
