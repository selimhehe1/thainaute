// Construit le contenu de tokens.css à partir des tokens TS.
// Générateur pur (aucun accès disque) : le script scripts/generate-css.ts
// écrit le fichier, le test tokens-css.test.ts vérifie l'absence de dérive.

import {
  colors,
  fontFamilies,
  fontWeights,
  minimumTouchTarget,
  motionDurations,
  motionEasings,
  radii,
  shadows,
  spacing,
  thaiScale,
} from "./index";

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
}

export function buildTokensCss(): string {
  const lines: string[] = [
    "/* Généré par `pnpm --filter @thainaute/design-tokens generate:css`.",
    "   Ne pas modifier à la main : la source de vérité est src/index.ts. */",
    ":root {",
  ];

  for (const [name, value] of Object.entries(colors)) {
    lines.push(`  --color-${toKebabCase(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(spacing)) {
    lines.push(`  --space-${name}: ${value}px;`);
  }
  for (const [name, value] of Object.entries(radii)) {
    lines.push(`  --radius-${name}: ${value}px;`);
  }
  for (const [name, value] of Object.entries(fontFamilies)) {
    lines.push(`  --font-${toKebabCase(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(fontWeights)) {
    lines.push(`  --weight-${toKebabCase(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(motionDurations)) {
    lines.push(`  --motion-${toKebabCase(name)}: ${value}ms;`);
  }
  for (const [name, value] of Object.entries(motionEasings)) {
    lines.push(`  --ease-${toKebabCase(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(shadows)) {
    lines.push(`  --shadow-${toKebabCase(name)}: ${value};`);
  }
  lines.push(`  --thai-scale: ${thaiScale};`);
  lines.push(`  --touch-target: ${minimumTouchTarget}px;`);
  lines.push("}");

  return `${lines.join("\n")}\n`;
}
