import { authoringCatalog } from "@thainaute/content";
import Link from "next/link";

import panel from "@/components/ui/panel.module.css";
import { lireCoursPublie } from "@/lib/lecons-publiees";

import styles from "./path.module.css";
import parcours from "./parcours-reel.module.css";

/**
 * Le parcours réel, unité par unité.
 *
 * CE QUE CE COMPOSANT NE DOIT PAS FAIRE : révéler un brouillon. Une leçon
 * non signée n'expose ni son titre, ni son objectif, ni son contenu. Elle
 * n'existe ici que comme un nombre, exactement comme sur Pratiquer. C'est
 * la même porte que celle de `/learn/lecon/[lecon]`, et `course-catalog`
 * la vérifie.
 *
 * Les unités ne portent pas encore de titre dans le modèle de données. En
 * inventer un, ou le reprendre d'une leçon en brouillon, révélerait
 * précisément ce que la porte protège. Elles sont donc numérotées.
 */
interface UniteDuParcours {
  readonly numero: number;
  readonly publiees: readonly {
    readonly slug: string;
    readonly titre: string;
    readonly exercices: number;
  }[];
  readonly enPreparation: number;
}

export function unitesDuParcours(): readonly UniteDuParcours[] {
  const parUnite = new Map<number, UniteDuParcours>();
  for (const entree of authoringCatalog) {
    const courante = parUnite.get(entree.unitNumber) ?? {
      numero: entree.unitNumber,
      publiees: [],
      enPreparation: 0,
    };
    const bundle = lireCoursPublie(entree.lessonId);
    parUnite.set(
      entree.unitNumber,
      bundle === null
        ? { ...courante, enPreparation: courante.enPreparation + 1 }
        : {
            ...courante,
            publiees: [
              ...courante.publiees,
              {
                slug: entree.lessonId,
                titre: bundle.lesson.titleFr,
                exercices: bundle.lesson.exercises.length,
              },
            ],
          },
    );
  }
  return [...parUnite.values()].sort((a, b) => a.numero - b.numero);
}

export function ParcoursReel({
  unites,
}: {
  readonly unites: readonly UniteDuParcours[];
}) {
  const totalPubliees = unites.reduce(
    (somme, unite) => somme + unite.publiees.length,
    0,
  );

  return (
    <section
      className={`${panel.panel} ${styles.catalogPanel}`}
      aria-labelledby="parcours-titre"
    >
      <p className={panel.eyebrow}>Parcours</p>
      <h1 className={styles.introTitle} id="parcours-titre">
        {totalPubliees === 0
          ? "Le premier cours arrive."
          : "Votre itinéraire, unité par unité."}
      </h1>
      <p className={panel.lede}>
        {totalPubliees === 0
          ? "Aucune leçon n’a encore franchi ses portes de publication."
          : "Les unités s’ouvrent l’une après l’autre. Celles qui restent en préparation n’annoncent que leur nombre : rien d’un brouillon n’est montré avant sa relecture."}
      </p>

      <ol className={parcours.unites}>
        {unites.map((unite) => (
          <li
            className={
              unite.publiees.length > 0
                ? `${parcours.unite} ${parcours.uniteOuverte}`
                : parcours.unite
            }
            key={unite.numero}
          >
            <h2 className={parcours.numero}>
              Unité {String(unite.numero).padStart(2, "0")}
            </h2>
            {unite.publiees.length > 0 && (
              <ul className={parcours.lecons}>
                {unite.publiees.map((lecon) => (
                  <li key={lecon.slug}>
                    <Link
                      className={parcours.lecon}
                      href={`/learn/lecon/${lecon.slug}`}
                    >
                      <span className={parcours.titre}>{lecon.titre}</span>
                      <span className={parcours.objectif}>
                        {lecon.exercices} exercice
                        {lecon.exercices > 1 ? "s" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {unite.enPreparation > 0 && (
              <p className={parcours.attente}>
                {unite.enPreparation} leçon
                {unite.enPreparation > 1 ? "s" : ""} en préparation. Revue par
                un locuteur natif : en attente.
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
