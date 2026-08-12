import Link from "next/link";

import styles from "./primary-navigation.module.css";

/**
 * Les trois destinations de l'apprentissage, identiques au mobile.
 *
 * `/practice` et `/progress` existaient sans qu'aucun lien n'y mène : deux
 * écrans injoignables autrement qu'en tapant l'adresse. Le mobile avait déjà
 * cette barre à trois onglets ; le web s'en passait parce que chaque page
 * fournissait ses liens à la main.
 *
 * L'onglet courant porte `aria-current="page"` ET un soulignement : la
 * position ne se devine pas à la seule couleur.
 */
const DESTINATIONS = [
  { href: "/today", label: "Aujourd’hui" },
  { href: "/practice", label: "Pratiquer" },
  { href: "/progress", label: "Progrès" },
] as const;

export type PrimaryRoute = (typeof DESTINATIONS)[number]["href"];

export function PrimaryNavigation({
  active,
}: {
  readonly active: PrimaryRoute;
}) {
  return (
    <>
      {DESTINATIONS.map(({ href, label }) => (
        <Link
          aria-current={href === active ? "page" : undefined}
          className={href === active ? styles.active : styles.link}
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
