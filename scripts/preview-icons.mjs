// Génère des variantes de logo/icône Mazala dans public/preview/ + une galerie HTML.
// Usage : node scripts/preview-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import opentype from "opentype.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "preview");
mkdirSync(outDir, { recursive: true });

const GOLD = "#CC8800";
const GOLD_L = "#F5A608";
const PURPLE = "#4A4860";
const PURPLE_D = "#2e2b3e";
const PURPLE_L = "#585371";
const PAPER = "#f7f7f7";

const font = opentype.parse(readFileSync(join(root, "public", "fonts", "LeviReBrushed.ttf")).buffer);

// Texte LeviReBrushed mono-couleur centré, largeur w px.
function brushText(text, w, fill) {
  const path = font.getPath(text, 0, 0, font.unitsPerEm);
  const bb = path.getBoundingBox();
  const scale = w / (bb.x2 - bb.x1);
  const tx = -bb.x1 - (bb.x2 - bb.x1) / 2;
  const ty = -bb.y1 - (bb.y2 - bb.y1) / 2;
  return `<g transform="scale(${scale.toFixed(4)}) translate(${tx.toFixed(2)} ${ty.toFixed(2)})"><path d="${path.toPathData(2)}" fill="${fill}"/></g>`;
}

// Texte LeviReBrushed multi-couleurs (une couleur par lettre), centré, largeur w px.
function brushLetters(text, w, fills) {
  const chars = [...text];
  const advances = chars.map((ch) => font.getAdvanceWidth(ch, font.unitsPerEm));
  const total = advances.reduce((a, b) => a + b, 0);
  const scale = w / total;
  let x = 0;
  let top = Infinity, bottom = -Infinity;
  const parts = chars.map((ch, i) => {
    const p = font.getPath(ch, 0, 0, font.unitsPerEm);
    const bb = p.getBoundingBox();
    top = Math.min(top, bb.y1 * scale);
    bottom = Math.max(bottom, bb.y2 * scale);
    const g = `<g transform="translate(${(x * scale).toFixed(2)} 0) scale(${scale.toFixed(4)})"><path d="${p.toPathData(2)}" fill="${fills[i % fills.length]}"/></g>`;
    x += advances[i];
    return g;
  });
  return `<g transform="translate(${(-(total * scale) / 2).toFixed(2)} ${(-(top + bottom) / 2).toFixed(2)})">${parts.join("")}</g>`;
}

const badge = (bg, r = 110) => `<rect width="512" height="512" rx="${r}" fill="${bg}"/>`;
const dot = `<circle cx="352" cy="332" r="22" fill="${GOLD_L}"/>`;

const variants = {
  // ——— Originales choisies ———
  "a-brush-mz": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PURPLE)}
    <g transform="translate(256 268)">${brushText("Mz", 250, PAPER)}</g>
  </svg>`,
  "e-brush-dot": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PURPLE_D)}
    <g transform="translate(230 262)">${brushText("Mz", 210, PAPER)}</g>
    ${dot}
  </svg>`,
  // ——— Perso palette plateforme ———
  "g1-mz-duo": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PURPLE)}
    <g transform="translate(256 268)">${brushLetters("Mz", 250, [GOLD_L, PAPER])}</g>
  </svg>`,
  "g2-mz-inv-FINAL": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(GOLD)}
    <g transform="translate(256 264)">${brushText("Mz", 300, PAPER)}</g>
  </svg>`,
  "g3-mz-grad": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD_L}"/><stop offset="1" stop-color="${GOLD}"/>
    </linearGradient></defs>
    ${badge(PURPLE_D)}
    <g transform="translate(256 268)">${brushText("Mz", 250, "url(#g)")}</g>
  </svg>`,
  "g4-mz-swoosh": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PURPLE)}
    <g transform="translate(256 258)">${brushText("Mz", 235, PAPER)}</g>
    <path d="M138 368 C 210 392 300 392 382 362" fill="none" stroke="${GOLD_L}" stroke-width="14" stroke-linecap="round"/>
  </svg>`,
  "g5-mz-dot-duo": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PURPLE_D)}
    <g transform="translate(230 262)">${brushLetters("Mz", 210, [GOLD_L, PAPER])}</g>
    ${dot}
  </svg>`,
  "g6-mz-dot-inv": `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${badge(PAPER)}
    <g transform="translate(230 262)">${brushText("Mz", 210, PURPLE)}</g>
    ${dot}
  </svg>`,
};

const names = Object.keys(variants);
for (const name of names) {
  await sharp(Buffer.from(variants[name])).png().toFile(join(outDir, `${name}.png`));
  await sharp(Buffer.from(variants[name])).resize(64).png().toFile(join(outDir, `${name}-64.png`));
  console.log(`✓ ${name}`);
}

const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Variantes icône Mazala</title>
<style>body{font-family:sans-serif;background:#eee;padding:2rem}h1{color:#4A4860}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2rem}.card{background:#fff;padding:1.5rem;border-radius:16px;text-align:center;box-shadow:0 2px 8px #0002}img{image-rendering:auto}.sizes{display:flex;align-items:flex-end;gap:1rem;justify-content:center;margin-top:1rem}.name{font-weight:bold;color:#CC8800;text-transform:uppercase;letter-spacing:.1em}</style>
</head><body><h1>Variantes d'icône — Mazala Firm</h1><div class="grid">
${names.map((n) => `<div class="card"><div class="name">${n}</div><img src="${n}.png" width="256"><div class="sizes"><img src="${n}-64.png" width="64"><img src="${n}-64.png" width="32"><img src="${n}-64.png" width="20"></div></div>`).join("\n")}
</div></body></html>`;
writeFileSync(join(outDir, "index.html"), html);
console.log("→ public/preview/index.html");
