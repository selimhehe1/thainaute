// Vérification de présence d'une graphie au dictionnaire royal (RID).
//
// Autorité normative du thaï, autorité n° 1 du projet pour l'orthographe.
// Ce script existe parce que plusieurs agents ont conclu à tort que le
// dictionnaire était inatteignable par outillage.
//
// Usage :
//   node scripts/verification/rid-lookup.mjs <graphie> [graphie...]
//
// Sortie, une ligne par mot :
//   entree      la graphie est une vedette autonome du dictionnaire
//   forme_liee  elle n'existe que préfixée ou suffixée (tiret dans la vedette)
//   absent      aucune vedette ne correspond
//
// DEUX PIÈGES QUI ONT DÉJÀ PRODUIT DE FAUX RELEVÉS :
//  1. Le paramètre `search` de l'URL publique ne déclenche AUCUNE recherche
//     côté serveur, et le message « ไม่พบคำศัพท์ที่ต้องการค้นหา » est un
//     bloc masqué présent sur TOUTES les pages, y compris celles qui
//     trouvent le mot. Seul le POST ci-dessous interroge réellement.
//  2. Un titre de résultat groupe parfois plusieurs vedettes séparées par
//     des virgules (« สวัสดิ-, สวัสดิ์ ๑, สวัสดี ๑ »). Sans découpage,
//     des mots présents sont déclarés absents.
//
// Ce que l'on conserve : la présence, jamais la définition. Une requête par
// mot, espacée d'une seconde, conformément à la politique de sources.

const NOISE = /[๐-๙\s]/g;
const words = process.argv.slice(2);

if (words.length === 0) {
  console.error("usage: node rid-lookup.mjs <graphie> [graphie...]");
  process.exit(2);
}

async function lookup(word) {
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
  const html = await response.text();
  return [...html.matchAll(/<div class="panel-title"><b>([^<]*)<\/b><\/div>/g)]
    .flatMap((match) => match[1].split(","))
    .map((head) => {
      const brut = head.replace(NOISE, "").trim();
      return { brut, forme: brut.replace(/^-+|-+$/g, "").normalize("NFC") };
    })
    .filter(({ forme }) => forme.length > 0 && !forme.startsWith("ผลการค้นหา"));
}

for (const [index, word] of words.entries()) {
  const cible = word.normalize("NFC");
  try {
    const heads = await lookup(cible);
    const autonome = heads.some(
      ({ brut, forme }) => forme === cible && !brut.includes("-"),
    );
    const liee = heads.some(({ forme }) => forme === cible);
    const statut = autonome ? "entree" : liee ? "forme_liee" : "absent";
    const voisines = [...new Set(heads.map(({ forme }) => forme))].slice(0, 6);
    console.log(`${cible}\t${statut}\t${voisines.join(" ")}`);
  } catch (error) {
    console.log(`${cible}\terreur\t${String(error)}`);
  }
  if (index < words.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}
