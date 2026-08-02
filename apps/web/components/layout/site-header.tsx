import Link from "next/link";
import type { ReactNode } from "react";

import { Logotype } from "@/components/brand/logotype";

import styles from "./site-header.module.css";

interface SiteHeaderProps {
  readonly navLabel: string;
  readonly children: ReactNode;
}

/** Header commun du carnet : mot-symbole à gauche, navigation à droite.
 * Chaque page fournit ses liens ; le libellé du lien de marque est fixe. */
export function SiteHeader({ navLabel, children }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Thaïnaute, accueil">
        <Logotype />
      </Link>
      <nav className={styles.nav} aria-label={navLabel}>
        {children}
      </nav>
    </header>
  );
}
