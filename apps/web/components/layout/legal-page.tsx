import Link from "next/link";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import panel from "@/components/ui/panel.module.css";

import styles from "./legal-page.module.css";

/**
 * Mise en page des documents que la loi impose, et d'eux seuls.
 *
 * Elle existe parce que les quatre pages légales partagent exactement la
 * même forme : un document daté, lisible sur 56 caractères, avec des titres
 * ancrés et un renvoi vers les autres documents. Les recopier quatre fois
 * ferait diverger la présentation d'un texte qui engage juridiquement.
 *
 * `updatedAt` est OBLIGATOIRE : un document légal sans date de mise à jour
 * ne vaut rien pour la personne qui le lit.
 */
export function LegalPage({
  children,
  eyebrow,
  lede,
  title,
  updatedAt,
}: {
  readonly children: ReactNode;
  readonly eyebrow: string;
  readonly lede: string;
  readonly title: string;
  readonly updatedAt: string;
}) {
  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation des pages légales">
        <Link href="/">Accueil</Link>
      </SiteHeader>
      <article className={panel.panel}>
        <p className={panel.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={panel.lede}>{lede}</p>
        <p className={styles.updated}>
          Dernière mise à jour :{" "}
          <time dateTime={updatedAt}>
            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
              new Date(updatedAt),
            )}
          </time>
        </p>
        <div className={styles.prose}>{children}</div>
        <nav aria-label="Autres documents" className={styles.related}>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/conditions">Conditions d’utilisation</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/cookies">Cookies et traceurs</Link>
        </nav>
      </article>
    </main>
  );
}

/**
 * Ce que seul le fondateur peut fournir, rendu VISIBLE au lieu d'être inventé.
 *
 * Écrire une identité d'éditeur plausible serait produire un faux document.
 * Ce marqueur est volontairement voyant : il doit gêner tant qu'il reste.
 */
export function ARenseigner({ children }: { readonly children: ReactNode }) {
  return (
    <mark className={styles.aRenseigner}>
      À renseigner par l’éditeur : {children}
    </mark>
  );
}
