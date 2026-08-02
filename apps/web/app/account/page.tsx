import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonClass } from "@/components/ui/button";
import panel from "@/components/ui/panel.module.css";

import { AccountExperience } from "./account-experience";

export const metadata = { title: "Compte" };

export default function AccountPage() {
  return (
    <main className={panel.shell}>
      <SiteHeader navLabel="Navigation du compte">
        <Link className={buttonClass("ghost")} href="/learn/demo">
          Revenir à la leçon
        </Link>
      </SiteHeader>
      <AccountExperience />
    </main>
  );
}
