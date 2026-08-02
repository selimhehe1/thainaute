import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <header className="siteHeader shell">
        <Link className="brand" href="/" aria-label="Thaïnaute, accueil">
          <span aria-hidden="true" className="brandMark">
            ท
          </span>
          <span>Thaïnaute</span>
        </Link>
        <nav aria-label="Navigation principale">
          <Link href="#methode">Méthode</Link>
          <Link href="/account">Compte</Link>
          <Link className="button buttonSmall buttonGhost" href="/today">
            Aujourd’hui
          </Link>
        </nav>
      </header>

      <section className="hero shell">
        <div className="heroCopy">
          <p className="eyebrow">
            Bêta privée · marque à confirmer juridiquement
          </p>
          <h1>
            Le thaï, enfin pensé <em>en français.</em>
          </h1>
          <p className="lede">
            Une méthode adulte qui rend visibles les sons, la lecture et la
            maîtrise — sans transformer l’apprentissage en punition.
          </p>
          <div className="heroActions">
            <Link className="button buttonPrimary" href="/today">
              Commencer sans compte
            </Link>
            <span className="quiet">
              Aucun compte. Aucun contenu pédagogique publié.
            </span>
          </div>
        </div>
        <div className="heroArtifact" aria-label="Aperçu de progression fictif">
          <div className="artifactTop">
            <span>Session du jour</span>
            <span>5–10 min</span>
          </div>
          <div className="thaiSpecimen" lang="th">
            ก่
          </div>
          <p>Signal Unicode de test</p>
          <div className="meter">
            <span style={{ width: "25%" }} />
          </div>
          <div className="artifactBottom">
            <strong>25 %</strong>
            <span>à confirmer</span>
          </div>
        </div>
      </section>

      <section
        className="principles shell"
        id="methode"
        aria-labelledby="method-title"
      >
        <div>
          <p className="eyebrow">Une fondation vérifiable</p>
          <h2 id="method-title">La confiance avant le volume.</h2>
        </div>
        <div className="principleGrid">
          <article>
            <span>01</span>
            <h3>Comprendre</h3>
            <p>
              Des explications conçues depuis les difficultés propres aux
              francophones.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Écouter</h3>
            <p>
              Un audio traçable, versionné et contrôlé avant toute publication.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Retenir</h3>
            <p>
              Une maîtrise estimée par les tentatives, avec une prochaine
              révision explicite.
            </p>
          </article>
        </div>
      </section>

      <footer className="shell siteFooter">
        <span>Thaïnaute · fondation technique privée</span>
        <span>Le nom et le contenu restent non publiés.</span>
      </footer>
    </main>
  );
}
