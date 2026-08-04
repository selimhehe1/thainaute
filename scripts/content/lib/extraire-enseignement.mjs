// Extraction des pages d'enseignement d'une leçon d'autorat.
//
// Pourquoi ce module existe
// -------------------------
// Le compilateur ne prenait que les items et les exercices. Les 636 pages
// d'enseignement du corpus, présentes dans les 65 leçons, étaient jetées.
//
// La conséquence était directement visible à l'écran : la toute première
// question du parcours demandait à un francophone n'ayant jamais entendu de
// thaï de distinguer cinq contours tonaux, sans lui avoir montré ce qu'est
// un ton. Un quiz sans cours.
//
// La section a une forme très régulière dans tout le corpus :
//
//   ## Enseignement
//
//   ### Page 1 : titre de la page
//
//   Prose, sur un ou plusieurs paragraphes.
//
//   Spécimen : ค่า ≠ ค้า
//
// Le spécimen est ce que la page donne à voir. Il est facultatif.

/** Titre d'une page, avec ou sans numéro explicite. */
const TITRE_PAGE = /^(?:Page\s*(\d+)\s*[:.]\s*)?(.+)$/u;
/** Ligne de spécimen, en fin de page. */
const SPECIMEN = /^\s*Sp[ée]cimen\s*:\s*(.+?)\s*$/mu;

/**
 * Pages d'enseignement d'une leçon, dans l'ordre.
 *
 * Renvoie un tableau vide si la section est absente : c'est un fait, pas
 * une erreur, et l'appelant décide ce qu'il en fait.
 */
export function analyserEnseignement(texte) {
  const section = texte.split(/^## Enseignement\s*$/mu)[1];
  if (section === undefined) return [];
  // On s'arrête à la section de premier niveau suivante.
  const corps = section.split(/^## /mu)[0] ?? "";

  const pages = [];
  let ordre = 0;
  for (const bloc of corps.split(/^### /mu).slice(1)) {
    const lignes = bloc.split("\n");
    const entete = (lignes[0] ?? "").trim();
    const trouve = entete.match(TITRE_PAGE);
    if (trouve === null) continue;

    ordre += 1;
    const reste = lignes.slice(1).join("\n");
    const specimen = reste.match(SPECIMEN)?.[1] ?? null;

    // Le corps est la prose, spécimen retiré. On garde les paragraphes,
    // qui portent le rythme de lecture voulu par l'auteur, et on ne
    // recolle que les retours à la ligne internes d'un paragraphe.
    const bodyFr = reste
      .replace(SPECIMEN, "")
      .split(/\n{2,}/u)
      .map((paragraphe) => paragraphe.replace(/\s*\n\s*/gu, " ").trim())
      .filter(Boolean)
      .join("\n\n")
      .trim();

    if (bodyFr === "") continue;

    pages.push({
      // Le numéro écrit fait foi quand il existe : une leçon peut
      // renuméroter ses pages, et l'ordre de lecture est le sien.
      ordre: trouve[1] === undefined ? ordre : Number(trouve[1]),
      titleFr: (trouve[2] ?? entete).trim().slice(0, 160),
      bodyFr: bodyFr.slice(0, 2400),
      specimen: specimen === null ? null : specimen.slice(0, 512),
    });
  }
  return pages;
}
