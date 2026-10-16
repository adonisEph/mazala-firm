// Génère les icônes PWA (public/icons/) à partir de la palette Mazala.
// Le "M" utilise le glyphe réel de LeviReBrushed (fonte du logo) extrait
// via opentype.js, puis rasterisé par sharp.
// Usage : node scripts/generate-icons.mjs
import { readFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import opentype from "opentype.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const GOLD = "#CC8800";
const PAPER = "#f7f7f7";

const font = opentype.parse(readFileSync(join(root, "public", "fonts", "LeviReBrushed.ttf")).buffer);

// Path SVG du glyphe "M", normalisé dans une boîte de `box` px, centré.
function glyphPath(box) {
  const scale = box / font.unitsPerEm;
  const path = font.getPath("M", 0, 0, font.unitsPerEm); // taille = unitsPerEm → scale 1
  const bb = path.getBoundingBox();
  const w = bb.x2 - bb.x1;
  const h = bb.y2 - bb.y1;
  const tx = -bb.x1 - w / 2;
  const ty = -bb.y1 - h / 2;
  const d = path.toPathData(2);
  return `<g transform="scale(${scale}) translate(${tx.toFixed(2)} ${ty.toFixed(2)})"><path d="${d}" fill="${PAPER}"/></g>`;
}

function svg({ size, radius, box }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${GOLD}"/>
  <g transform="translate(${(size / 2).toFixed(1)} ${(size / 2).toFixed(1)})">${glyphPath(box)}</g>
</svg>`;
}

const icons = [
  // Icônes standards
  { name: "icon-192.png", size: 192, radius: 40, box: 120 },
  { name: "icon-512.png", size: 512, radius: 108, box: 320 },
  // Maskable : fond plein (safe zone = cercle 80%), lettre réduite
  { name: "maskable-192.png", size: 192, radius: 0, box: 88 },
  { name: "maskable-512.png", size: 512, radius: 0, box: 236 },
  // iOS : carré plein sans transparence (iOS applique son propre arrondi)
  { name: "apple-touch-icon.png", size: 180, radius: 0, box: 100 },
  { name: "favicon-32.png", size: 32, radius: 7, box: 21 },
];

for (const icon of icons) {
  const buf = Buffer.from(svg(icon));
  await sharp(buf).png().toFile(join(outDir, icon.name));
  console.log(`✓ public/icons/${icon.name}`);
}
