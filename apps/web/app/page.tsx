import Link from "next/link";

import { BrandCurve, ToneCurve } from "@/components/brand/tone-curve";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import type { ToneCurveName } from "@thainaute/design-tokens";

import styles from "./home.module.css";

const TONES: ReadonlyArray<{ tone: ToneCurveName; label: string }> = [
  { tone: "mid", label: "Ton moyen" },
  { tone: "low", label: "Ton bas" },
  { tone: "falling", label: "Ton descendant" },
  { tone: "high", label: "Ton haut" },
  { tone: "rising", label: "Ton montant" },
];

export default function HomePage() {
  return (
    <main>
      <div className={styles.shell}>
        <SiteHeader navLabel="Navigation principale">
          <Link href="#methode">Méthode</Link>
          <Link href="/path">Parcours</Link>
          <Link href="/account">Compte</Link>
          <Link className={buttonClass("ghost")} href="/today">
            Aujourd’hui
          </Link>
        </SiteHeader>
      </div>

      <section className={`${styles.hero} ${styles.shell}`}>
        <div className={styles.heroHalo} aria-hidden="true" />
        <div className={styles.heroSpecimen} lang="th" aria-hidden="true">
          ไทย
        </div>
        <p className={styles.eyebrow}>
          Bêta privée · marque à confirmer juridiquement
        </p>
        <h1 className={styles.heroTitle}>
          Le thaï, enfin pensé <em>en français.</em>
        </h1>
        <BrandCurve
          className={styles.heroCurve}
          curve="hero"
          width={280}
          height={52}
          strokeWidth={7}
        />
        <p className={styles.lede}>
          Une méthode adulte qui rend visibles les sons, la lecture et la
          maîtrise, sans transformer l’apprentissage en punition.
        </p>
        <div className={styles.heroActions}>
          <Link className={buttonClass("primary")} href="/today">
            Commencer sans compte
          </Link>
          <span className={styles.quiet}>
            Aucun compte. Aucun contenu pédagogique publié.
          </span>
        </div>
      </section>

      <section
        className={`${styles.tones} ${styles.shell}`}
        aria-labelledby="tones-title"
      >
        <p className={styles.eyebrow}>La signature de la méthode</p>
        <h2 className={styles.sectionTitle} id="tones-title">
          Cinq tons, cinq courbes.
        </h2>
        <p className={styles.sectionNote}>
          Chaque ton thaï est un contour mélodique. Thaïnaute les dessine, les
          fait écouter et les suit dans votre progression : la forme et le
          libellé portent l’information, jamais la couleur seule.
        </p>
        <div className={styles.toneGrid}>
          {TONES.map(({ tone, label }) => (
            <div key={tone} className={styles.toneCard}>
              <ToneCurve tone={tone} title={label} />
              <p className={styles.toneName}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`${styles.principles} ${styles.shell}`}
        id="methode"
        aria-labelledby="method-title"
      >
        <p className={styles.eyebrow}>Une fondation vérifiable</p>
        <h2 className={styles.sectionTitle} id="method-title">
          La confiance avant le volume.
        </h2>
        <div className={styles.principleGrid}>
          <article>
            <span aria-hidden="true">1</span>
            <h3>Comprendre</h3>
            <p>
              Des explications conçues depuis les difficultés propres aux
              francophones.
            </p>
          </article>
          <article>
            <span aria-hidden="true">2</span>
            <h3>Écouter</h3>
            <p>
              Un audio traçable, versionné et contrôlé avant toute publication.
            </p>
          </article>
          <article>
            <span aria-hidden="true">3</span>
            <h3>Retenir</h3>
            <p>
              Une maîtrise estimée par les tentatives, avec une prochaine
              révision explicite.
            </p>
          </article>
        </div>
      </section>

      <footer className={`${styles.footer} ${styles.shell}`}>
        <span>Thaïnaute · fondation technique privée</span>
        <Link href="/privacy">Confidentialité et mesure d’audience</Link>
        <span>Le nom et le contenu restent non publiés.</span>
      </footer>
    </main>
  );
}
