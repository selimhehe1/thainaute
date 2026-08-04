// Découpage d'une transcription phonétique thaïe en syllabes, puis de
// chaque syllabe en initiale, voyelle, finale et ton.
//
// Pourquoi ce module existe
// -------------------------
// Le schéma de contenu exige, par syllabe, une `initial`, une `final`, un
// `ipa`, un `tone` et une `vowelLength` non nuls. Les fichiers d'autorat ne
// portent ni initiale ni finale : ils portent l'IPA complète de l'item.
//
// Ces deux champs sont donc DÉRIVÉS, pas devinés. Aucun modèle n'intervient,
// et la dérivation se vérifie elle-même : la concaténation
// initiale + voyelle + finale + ton doit reproduire EXACTEMENT la syllabe
// de départ. Sinon, le découpage est refusé.
//
// Pourquoi le SON et pas la LETTRE
// --------------------------------
// L'unité 9 enseigne précisément que ด, ต, ถ, ท et ส donnent tous la même
// finale [t]. Une finale utile à l'apprenant est donc le son, pas la
// lettre. L'IPA le porte déjà ; la lettre reste lisible dans `thaiRaw`.

// Lettres de ton de l'API (barres de hauteur). Toujours en fin de syllabe.
const TONS = /[˥-˩]+$/u;

// Initiales du thaï standard, y compris les groupes. Triées du plus long au
// plus court : l'appariement doit être glouton, sinon /kʰ/ serait coupé en
// /k/ et le /ʰ/ finirait dans la voyelle.
const INITIALES = [
  "t͡ɕʰ",
  "t͡ɕ",
  "kʰw",
  "kʰr",
  "kʰl",
  "pʰr",
  "pʰl",
  "tʰr",
  "kw",
  "kr",
  "kl",
  "pr",
  "pl",
  "tr",
  "pʰ",
  "tʰ",
  "kʰ",
  "ŋ",
  "ʔ",
  "b",
  "d",
  "f",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "r",
  "s",
  "t",
  "w",
].sort((a, b) => b.length - a.length);

// Finales possibles du thaï : trois occlusives non relâchées, trois nasales,
// deux semi-voyelles. Le thaï n'en admet pas d'autres.
const FINALES = ["k̚", "t̚", "p̚", "ŋ", "m", "n", "w", "j"].sort(
  (a, b) => b.length - a.length,
);

// Une voyelle longue porte le signe de longueur, ou est une diphtongue
// longue. On lit la longueur sur la voyelle elle-même plutôt que de faire
// confiance au champ `longueur`, qui est parfois de la prose.
function longueurVoyelle(voyelle) {
  if (voyelle.includes("ː")) return "long";
  return "short";
}

const TONS_PAR_CONTOUR = {
  "˧": "mid", // ˧
  "˨˩": "low", // ˨˩
  "˥˩": "falling", // ˥˩
  "˦˥": "high", // ˦˥
  "˩˩˦": "rising", // ˩˩˦
};

/** Nom du ton depuis ses barres de hauteur, ou `null` si non canonique. */
export function tonDepuisContour(barres) {
  return TONS_PAR_CONTOUR[barres] ?? null;
}

/**
 * Découpe UNE syllabe. Renvoie `null` si le découpage ne se reconstitue
 * pas à l'identique : mieux vaut refuser que produire une initiale fausse.
 */
export function decouperSyllabe(syllabe) {
  const brut = syllabe.normalize("NFC").trim();
  if (brut === "") return null;

  const tonTrouve = brut.match(TONS);
  const ton = tonTrouve ? tonTrouve[0] : "";
  const sansTon = ton === "" ? brut : brut.slice(0, -ton.length);

  const initiale = INITIALES.find((candidat) => sansTon.startsWith(candidat));
  if (initiale === undefined) return null;
  const apresInitiale = sansTon.slice(initiale.length);

  const finale =
    FINALES.find(
      (candidat) =>
        apresInitiale.endsWith(candidat) &&
        apresInitiale.length > candidat.length,
    ) ?? "";
  const voyelle =
    finale === ""
      ? apresInitiale
      : apresInitiale.slice(0, apresInitiale.length - finale.length);

  if (voyelle === "") return null;

  // Le contrôle qui rend cette dérivation digne de confiance.
  if (initiale + voyelle + finale + ton !== brut) return null;

  return {
    ipa: brut,
    initial: initiale,
    vowel: voyelle,
    // Une syllabe ouverte n'a pas de finale. Le schéma exige une valeur non
    // nulle : on la nomme explicitement plutôt que de laisser un vide qui
    // se lirait « non renseigné ».
    final: finale === "" ? "aucune" : finale,
    tone: tonDepuisContour(ton),
    vowelLength: longueurVoyelle(voyelle),
  };
}

/**
 * Découpe une IPA d'item complète, de la forme `/xxx.yyy/`.
 *
 * Renvoie `null` dès que le champ n'est PAS une IPA nue : les fichiers
 * d'autorat y écrivent parfois de la prose, par exemple
 * « lettre seule /kɔː˧/ ; mot-image ไก่ /kaj˨˩/ » pour les items qui sont
 * des lettres de l'alphabet et non des mots. Un tel item ne se range pas
 * dans un schéma qui modélise un mot et ses syllabes ; il doit être
 * signalé, pas forcé.
 */
/**
 * Sépare un champ `ipa` en formes phonétiques distinctes, quand le champ en
 * porte plusieurs.
 *
 * Relevé sur le corpus le 2026-08-04, cinq familles. Deux sont mécaniquement
 * résolubles, deux non, et la distinction est délibérée :
 *
 *  - `sepd` : plusieurs graphies, autant d'IPA, appariables une à une.
 *    « /sa˨˩.baːj˧.diː˧/ et /sa˨˩.baːj˧.diː˧.maj˩˩˦/ » pour
 *    « สบายดี / สบายดีไหม ». Résolue : on apparie par rang.
 *  - `lettre` : « lettre seule /kɔː˧/ ; mot-image ไก่ /kaj˨˩/ ». Résolue :
 *    la prononciation canonique d'une lettre est son NOM, et le mot-image
 *    est un moyen mnémotechnique qui relève de l'enseignement, pas de la
 *    phonologie de l'item.
 *  - `variante` (`;` hors « lettre seule ») et `compose` (`+`) : NON
 *    résolues. Choisir entre une forme standard et une variante familière,
 *    ou décider si un bloc composé est un item ou deux, est une décision
 *    éditoriale. Le compilateur la signale, il ne la prend pas.
 */
export function formesDuChamp(champIpa) {
  const brut = (champIpa ?? "").trim();
  if (brut === "") return { famille: "absent", formes: [] };

  const toutes = [...brut.matchAll(/\/[^/]+\//gu)].map((trouve) => trouve[0]);

  if (/lettre seule/u.test(brut)) {
    // La première IPA est celle du nom de la lettre.
    return { famille: "lettre", formes: toutes.slice(0, 1) };
  }
  if (/\+/u.test(brut)) return { famille: "compose", formes: toutes };
  if (/;/u.test(brut)) return { famille: "variante", formes: toutes };
  if (toutes.length > 1) return { famille: "separees", formes: toutes };
  return { famille: "unique", formes: toutes };
}

export function decouperItem(champIpa) {
  if (typeof champIpa !== "string") return null;
  // Une note française peut suivre l'IPA, comme dans
  // « /lɛːw˦˥.t͡ɕɤː˧.kan˧/ (composé des entrées แล้ว et เจอกัน) ». On la
  // retire, mais SEULEMENT si ce qui reste est une IPA nue : on ne veut
  // surtout pas rattraper de force les champs qui décrivent deux objets,
  // comme « lettre seule /kɔː˧/ ; mot-image ไก่ /kaj˨˩/ ».
  const brut = champIpa
    .trim()
    .replace(/\s*\([^)]*\)\s*$/u, "")
    .trim();
  const encadre = brut.match(/^\/([^/]+)\/$/u);
  if (encadre === null) return null;

  const syllabes = encadre[1].split(".").map((part) => part.trim());
  const decoupees = syllabes.map(decouperSyllabe);
  if (decoupees.some((syllabe) => syllabe === null)) return null;

  // Reconstitution de l'ensemble, pour que le découpage en syllabes soit
  // vérifié au même titre que le découpage interne de chacune.
  if (`/${decoupees.map((s) => s.ipa).join(".")}/` !== brut) return null;

  return decoupees;
}
