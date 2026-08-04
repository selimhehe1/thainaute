// Rattachement des neuf capacités de u12-l12a : chaque leçon citée publie-t-elle
// un bloc de la page, ou au moins une brique d'un bloc de la page ?
// Consolidation du 2026-08-04.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const AUTH = "C:/Users/Selim/Documents/Thainaute/content/authoring";

function publies(ref) {
  const m = ref.match(/^u(\d{2})-l(\d+)([a-e])$/);
  const p = join(AUTH, "unite-" + m[1], "lecon-" + m[2] + m[3] + ".md");
  const txt = readFileSync(p, "utf8");
  const out = new Set();
  for (const mm of txt.matchAll(/^\s*-\s+`thai`\s*:\s*(.+)$/gm)) {
    for (const part of mm[1].split(/\s*[/·]\s*/)) {
      const q = part.replace(/\(.*?\)/g, "").trim();
      if (q) out.add(q);
    }
  }
  return out;
}

const capacites = [
  {
    n: 1,
    lecons: ["u01-l1e", "u02-l2b", "u02-l2c", "u02-l2d", "u02-l2e"],
    blocs: [
      "สวัสดีครับ",
      "สวัสดีค่ะ",
      "ผมชื่อ … ครับ",
      "คุณชื่ออะไรครับ",
      "สบายดีไหมครับ",
      "ขอบคุณครับ",
      "แล้วเจอกัน",
    ],
  },
  {
    n: 2,
    lecons: ["u03-l3b", "u03-l3c", "u03-l3d", "u08-l8e"],
    blocs: ["อันนี้เท่าไรครับ", "ตัวนี้เท่าไรครับ", "กี่บาท", "ห้าสิบบาท"],
  },
  {
    n: 3,
    lecons: ["u02-l2c", "u04-l4b", "u04-l4c", "u04-l4d", "u07-l7e"],
    blocs: [
      "ขอข้าวผัดสองจานหน่อยครับ",
      "ขอน้ำหน่อย",
      "ไม่เผ็ด",
      "เผ็ดนิดหน่อย",
      "อร่อยมาก",
    ],
  },
  {
    n: 4,
    lecons: ["u05-l5b", "u05-l5c", "u05-l5d", "u05-l5e"],
    blocs: [
      "ห้องน้ำอยู่ที่ไหนครับ",
      "ตลาดอยู่ที่ไหน",
      "ไกลไหม",
      "ไม่ไกล",
      "เลี้ยวซ้าย",
      "เลี้ยวขวา",
      "ตรงไป",
    ],
  },
  {
    n: 5,
    lecons: ["u06-l6b", "u06-l6c", "u06-l6d", "u06-l6e", "u07-l7c", "u07-l7d"],
    blocs: [
      "ผมมีพี่ชายสองคนครับ",
      "มีกี่คน",
      "แล้วคุณล่ะ",
      "เขาใจดี",
      "ผมทำงานที่บ้านทุกวันครับ",
      "ผมไปตลาดตอนเช้าครับ",
    ],
  },
  {
    n: 6,
    lecons: ["u08-l8a", "u08-l8b", "u08-l8c", "u08-l8d", "u08-l8e"],
    blocs: [
      "ผมหาเสื้อครับ",
      "อันนี้แพงเกินไปครับ",
      "ตัวนี้ใหญ่เกินไปครับ",
      "อันนี้ไม่ใช่ครับ",
      "มีปัญหาครับ",
      "ขอเปลี่ยนหน่อยครับ",
    ],
  },
  {
    n: 7,
    lecons: ["u09-l9a", "u09-l9b", "u09-l9c", "u09-l9d", "u09-l9e"],
    blocs: [
      "ผมปวดหัวครับ",
      "ปวดท้อง",
      "ผมไม่สบายครับ",
      "สองวันแล้ว",
      "ช่วยด้วย",
      "ช่วยเรียกหมอครับ",
      "ร้านขายยาอยู่ที่ไหนครับ",
    ],
  },
  {
    n: 8,
    lecons: [
      "u10-l10a",
      "u10-l10b",
      "u10-l10c",
      "u10-l10d",
      "u10-l10e",
      "u03-l3b",
    ],
    blocs: ["ทางเข้า", "ทางออก", "เปิด", "ปิด", "ห้ามเข้า", "ข้าวผัดหมู"],
  },
  {
    n: 9,
    lecons: ["u11-l11a"],
    blocs: [
      "ไม่เข้าใจ",
      "เข้าใจนิดหน่อย",
      "พูดอีกทีได้ไหมครับ",
      "พูดช้า ๆ ได้ไหมครับ",
    ],
  },
];

for (const c of capacites) {
  const lignes = [];
  for (const l of c.lecons) {
    const pub = publies(l);
    const exact = [...pub].filter((g) => c.blocs.includes(g));
    const brique = [...pub].filter(
      (g) =>
        g.length >= 2 &&
        !c.blocs.includes(g) &&
        c.blocs.some((b) => b.includes(g)),
    );
    lignes.push(
      `   ${l} : bloc entier ${exact.length}${exact.length ? " (" + exact.join(" ") + ")" : ""}` +
        ` | brique ${brique.length}${brique.length ? " (" + brique.slice(0, 6).join(" ") + ")" : ""}`,
    );
  }
  console.log(`capacité ${c.n}`);
  console.log(lignes.join("\n"));
}
