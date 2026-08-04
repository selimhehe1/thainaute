import { readFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = "C:/Users/Selim/Documents/Thainaute";
const AUTH = join(ROOT, "content", "authoring");
const src = readFileSync(join(AUTH, "unite-12", "lecon-12a.md"), "utf8");
const lines = src.split(/\r?\n/);
const start = lines.findIndex((l) => /^### Les \d+ blocs/.test(l));
const end = lines.findIndex((l) => l.startsWith("**Le tableau porte"));
const rows = [];
for (let i = start; i < end; i++) {
  const l = lines[i];
  if (!l.startsWith("|")) continue;
  const cells = l.split("|").map((s) => s.trim());
  if (cells.length < 4) continue;
  if (cells[1].startsWith("---")) continue;
  if (cells[1] === "Bloc") continue;
  rows.push({ line: i + 1, thai: cells[1], src: cells[2], tr: cells[3] });
}
console.log("lignes de donnees :", rows.length);

function lessonPath(ref) {
  const m = ref.match(/^u(\d{2})-l(\d+)([a-e])$/);
  if (!m) return null;
  return join(AUTH, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
}
const cache = new Map();
function readLesson(p) {
  if (!cache.has(p)) cache.set(p, readFileSync(p, "utf8"));
  return cache.get(p);
}
function getItem(file, n) {
  const ls = readLesson(file).split(/\r?\n/);
  const re = new RegExp("^### Item " + n + "(?![0-9])");
  const idx = ls.findIndex((l) => re.test(l));
  if (idx < 0) return null;
  const buf = [];
  for (let j = idx + 1; j < ls.length; j++) {
    if (/^#{2,3} /.test(ls[j])) break;
    buf.push(ls[j]);
  }
  const body = buf.join("\n");
  // recolle les continuations de ligne (indentation) pour chaque champ
  const all = (name) => {
    const out = [];
    const bl = body.split("\n");
    for (let k = 0; k < bl.length; k++) {
      const rx = new RegExp("^\\s*-\\s+`?" + name + "`?\\s*:\\s*(.*)$");
      const mm = bl[k].match(rx);
      if (!mm) continue;
      let v = mm[1].trim();
      for (let q = k + 1; q < bl.length; q++) {
        if (/^\s*-\s/.test(bl[q]) || /^\s*$/.test(bl[q]) || /^#/.test(bl[q]))
          break;
        v += " " + bl[q].trim();
      }
      out.push(v.trim());
    }
    return out;
  };
  return {
    title: ls[idx],
    thai: all("thai"),
    tr: all("transcription"),
    fr: all("fr"),
    ton: all("ton"),
    reg: all("registre"),
  };
}

let ok = 0;
const bad = [];
for (const r of rows) {
  const m = r.src.match(/`(u\d{2}-l\d+[a-e])`\s*item\s*(\d+)/);
  if (!m) {
    bad.push([r.line, r.thai, "REF ILLISIBLE: " + r.src]);
    continue;
  }
  const p = lessonPath(m[1]);
  let it;
  try {
    it = getItem(p, m[2]);
  } catch (e) {
    bad.push([r.line, r.thai, "FICHIER ABSENT " + p]);
    continue;
  }
  if (!it) {
    bad.push([r.line, r.thai, "ITEM " + m[2] + " ABSENT de " + m[1]]);
    continue;
  }
  const clean = (s) =>
    (s || "")
      .replace(/\(.*?\)/g, "")
      .replace(/[«»]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const wantThai = r.thai.trim();
  const wantTr = r.tr.replace(/`/g, "").replace(/\s+/g, " ").trim();
  const parts = (s) =>
    s
      .split(/\s*\/\s*/)
      .map((x) => x.trim())
      .filter(Boolean);
  const hit = (list, want) =>
    list.some((raw) => {
      const v = clean(raw);
      return (
        v === want ||
        parts(v).includes(want) ||
        parts(want).every((x) => v.includes(x))
      );
    });
  const thaiMatch = hit(it.thai, wantThai);
  const trMatch = hit(it.tr, wantTr);
  if (thaiMatch && trMatch) ok++;
  else
    bad.push([
      r.line,
      wantThai,
      `${m[1]} it${m[2]} | thaiOK=${thaiMatch} trOK=${trMatch} | SRC thai=${JSON.stringify(it.thai)} tr=${JSON.stringify(it.tr)} | 12A tr="${wantTr}"`,
    ]);
}
console.log("OK:", ok, "ECARTS:", bad.length);
for (const b of bad) console.log("L" + b[0], b[1], "->", b[2]);
