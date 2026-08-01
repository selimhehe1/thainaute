import type { Metadata } from "next";
import type { ReactNode } from "react";

import { createSiteMetadata } from "@/lib/server/site-metadata";

import "./globals.css";

export function generateMetadata(): Metadata {
  return createSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
