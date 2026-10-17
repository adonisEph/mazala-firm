// Génère les icônes PWA (public/icons/) + le badge SVG de la navbar.
// Design : badge arrondi or (#CC8800), monogramme « Mz » blanc en
// LeviReBrushed (fonte du logo) extrait via opentype.js, rasterisé par sharp.
// Usage : node scripts/generate-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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

// Texte LeviReBrushed centré, largeur w px.
function brushText(text, w, fill) {
  const path = font.getPath(text, 0, 0, font.unitsPerEm);
  const bb = path.getBoundingBox();
  const scale = w / (bb.x2 - bb.x1);
  const tx = -bb.x1 - (bb.x2 - bb.x1) / 2;
  const ty = -bb.y1 - (bb.y2 - bb.y1) / 2;
  return `<g transform="scale(${scale.toFixed(4)}) translate(${tx.toFixed(2)} ${ty.toFixed(2)})"><path d="${path.toPathData(2)}" fill="${fill}"/></g>`;
}

function svg({ size, radius, box }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${GOLD}"/>
  <g transform="translate(${(size / 2).toFixed(1)} ${(size / 2 + size * 0.015).toFixed(1)})">${brushText("Mz", box, PAPER)}</g>
</svg>`;
}


const icons = [
  // Icônes standards
  { name: "icon-192.png", size: 192, radius: 40, box: 112 },
  { name: "icon-512.png", size: 512, radius: 108, box: 300 },
  // Maskable : fond plein (safe zone = cercle 80%), lettres réduites
  { name: "maskable-192.png", size: 192, radius: 0, box: 82 },
  { name: "maskable-512.png", size: 512, radius: 0, box: 220 },
  // iOS : carré plein sans transparence (iOS applique son propre arrondi)
  { name: "apple-touch-icon.png", size: 180, radius: 0, box: 96 },
  { name: "favicon-32.png", size: 32, radius: 7, box: 19 },
];

for (const icon of icons) {
  const buf = Buffer.from(svg(icon));
  await sharp(buf).png().toFile(join(outDir, icon.name));
  console.log(`✓ public/icons/${icon.name}`);
}

