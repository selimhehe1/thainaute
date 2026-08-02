import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { PrivacyExperience } from "./privacy-experience";

export const metadata = { title: "Confidentialité et mesure d’audience" };

export default function PrivacyPage() {
  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation">
        <Link className={buttonClass("ghost")} href="/">
          Retour à l’accueil
        </Link>
      </SiteHeader>
      <PrivacyExperience />
    </main>
  );
}
