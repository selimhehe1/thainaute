// Écrit src/tokens.css depuis la source de vérité TS.
// Usage : pnpm --filter @thainaute/design-tokens generate:css

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildTokensCss } from "../src/generate-css";

const target = fileURLToPath(new URL("../src/tokens.css", import.meta.url));
writeFileSync(target, buildTokensCss(), "utf8");
process.stdout.write(`tokens.css régénéré : ${target}\n`);
