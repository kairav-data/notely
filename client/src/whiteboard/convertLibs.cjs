const fs = require('fs');
const path = require('path');

const libDir = 'C:\\Users\\KAIRAV\\Claude\\Projects\\notes\\excildraw_library';
const files = fs.readdirSync(libDir).filter(f => f.endsWith('.excalidrawlib'));

console.log('Found library files:', files);

function formatCategoryName(filename) {
  const name = filename.replace('.excalidrawlib', '');
  const map = {
    'UML-ER-library': 'UML & ER Diagrams',
    'architecture-diagram-components': 'Architecture',
    'awesome-icons': 'Awesome Icons',
    'aws-architecture-icons': 'AWS Architecture',
    'cloud': 'Cloud Infrastructure',
    'data-viz': 'Data Visualization',
    'drwnio': 'Draw.io Stencils',
    'forms': 'Forms & UI Controls',
    'software-architecture': 'Software Architecture',
    'stick-figures': 'Stick Figures & People',
    'system-design': 'System Design',
  };
  return map[name] || name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const allCategories = [];

files.forEach(file => {
  const filePath = path.join(libDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const catName = formatCategoryName(file);
  try {
    const data = JSON.parse(content);
    const items = data.library || data.libraryItems || [];

    items.forEach((item, index) => {
      const elements = Array.isArray(item) ? item : (item.elements || [item]);

      const normalizedElements = elements.map(el => {
        return {
          type: el.type === 'freedraw' ? 'pen' : (el.type || 'rectangle'),
          x: el.x || 0,
          y: el.y || 0,
          width: el.width || 100,
          height: el.height || 60,
          x2: el.x2 ?? ((el.x || 0) + (el.width || 100)),
          y2: el.y2 ?? ((el.y || 0) + (el.height || 60)),
          strokeColor: el.strokeColor || '#1e1e1e',
          backgroundColor: el.backgroundColor || 'transparent',
          fillStyle: el.fillStyle || 'solid',
          strokeWidth: el.strokeWidth || 1.5,
          strokeStyle: el.strokeStyle || 'solid',
          roughness: el.roughness ?? 1,
          opacity: el.opacity ?? 100,
          text: el.text || '',
          fontSize: el.fontSize || 18,
          fontFamily: el.fontFamily || "'Caveat', cursive",
          angle: el.angle || 0,
          roundness: el.roundness ? true : false,
          elbowPoints: el.elbowPoints || null,
          points: el.points || null,
        };
      });

      const validEls = normalizedElements.filter(el => !el.isDeleted);
      if (validEls.length === 0) return;

      const textEl = validEls.find(el => el.type === 'text' && el.text.trim());
      const itemName = textEl ? textEl.text.split('\n')[0].substring(0, 24) : `${catName} Shape ${index + 1}`;

      allCategories.push({
        id: `lib-${file.replace('.excalidrawlib', '')}-${index}`,
        name: itemName,
        category: catName,
        elements: validEls,
      });
    });
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
});

console.log(`Total stencils generated: ${allCategories.length}`);

const outPath = 'C:\\Users\\KAIRAV\\Claude\\Projects\\notes\\client\\src\\whiteboard\\downloadedLibraries.js';
const jsContent = `// Pre-built Excalidraw shape libraries loaded from excildraw_library directory\nexport const DOWNLOADED_LIBRARIES = ${JSON.stringify(allCategories, null, 2)};\n`;

fs.writeFileSync(outPath, jsContent, 'utf-8');
console.log('Saved to:', outPath);
