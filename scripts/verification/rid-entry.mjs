// Lecture du CORPS d'une entrée du dictionnaire royal (RID), et pas seulement
// de sa présence, que `rid-lookup.mjs` suffit à établir.
//
// POURQUOI CE SCRIPT EXISTE. Les dossiers de production citent des lectures
// entre crochets du RID (« [เปฺลี่ยน] ») comme preuve qu'un groupe de deux
// lettres se lit d'un seul souffle. Ces citations étaient jusqu'ici faites à
// la main, donc invérifiables par un autre agent, alors que ce sont les faits
// les plus lourds du bloc d'écriture. Le contre-audit de `u08-l8a` du
// 2026-08-04 a en outre montré qu'une lecture entre crochets peut trancher une
// question de segmentation (ว graphème vocalique contre ว consonne finale).
//
// LE PIÈGE PRINCIPAL, déjà documenté par `u07-l7a` et reproduit ici. Dans les
// entrées de classe, le service ne renvoie PAS les marques de ton en U+0E48 à
// U+0E4B mais des caractères de la zone à usage privé, U+F70A à U+F70D. Un
// dépouillement naïf du HTML les efface en silence. Toute la plage
// U+E000..U+F8FF est donc ÉCHAPPÉE explicitement en <U+XXXX> à l'affichage,
// de sorte que rien ne disparaisse sans se voir.
//
// Usage :
//   node scripts/verification/rid-entry.mjs <graphie> [graphie...]
//   node scripts/verification/rid-entry.mjs --codes <graphie>   (points de code)
//
// Une requête par mot, espacée de 1,2 s, conformément à la politique de
// sources. Ce script LIT ; il n'appartient à aucune leçon de reproduire une
// définition du RID, que la politique interdit de recopier.

const args = process.argv.slice(2);
const wantCodes = args.includes("--codes");
const words = args.filter((a) => a !== "--codes");

if (words.length === 0) {
  console.error("usage: node rid-entry.mjs [--codes] <graphie> [graphie...]");
  process.exit(2);
}

const escapePua = (text) =>
  [...text]
    .map((ch) => {
      const cp = ch.codePointAt(0);
      return cp >= 0xe000 && cp <= 0xf8ff
        ? `<U+${cp.toString(16).toUpperCase().padStart(4, "0")}>`
        : ch;
    })
    .join("");

const stripTags = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(div|p|li|tr)>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("ไม่พบคำศัพท์"))
    .join("\n");

async function fetchEntry(word) {
  const response = await fetch(
    "https://dictionary.orst.go.th/func_lookup.php",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-requested-with": "XMLHttpRequest",
        referer: "https://dictionary.orst.go.th/",
        "user-agent":
          "Thainaute-verification/1.0 (verification orthographique)",
      },
      body: new URLSearchParams({
        word,
        funcName: "lookupWord",
        status: "lookup",
      }),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

for (const [index, word] of words.entries()) {
  const cible = word.normalize("NFC");
  console.log(`\n===== ${cible} =====`);
  try {
    const body = stripTags(await fetchEntry(cible));
    console.log(escapePua(body));

    // Les lectures entre crochets sont le fait le plus cité : on les ressort
    // isolément, avec leur séquence de points de code, pour qu'une citation
    // de leçon soit comparable caractère par caractère.
    const brackets = [...body.matchAll(/\[([^\]]{1,60})\]/g)].map((m) => m[1]);
    if (brackets.length > 0) {
      console.log("\n-- lectures entre crochets --");
      for (const b of [...new Set(brackets)]) {
        const codes = [...b]
          .map(
            (ch) =>
              `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
          )
          .join(" ");
        console.log(`[${escapePua(b)}]\t${codes}`);
      }
    }

    if (wantCodes) {
      console.log("\n-- points de code du corps --");
      console.log(
        [...body]
          .map(
            (ch) =>
              `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
          )
          .join(" "),
      );
    }
  } catch (error) {
    console.log(`erreur\t${String(error)}`);
  }
  if (index < words.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}
