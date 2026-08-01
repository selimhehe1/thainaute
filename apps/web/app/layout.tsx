import type { Metadata } from "next";
import type { ReactNode } from "react";

import { WebAuthSessionProvider } from "@/lib/client/auth-session";
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
      <body>
        <WebAuthSessionProvider>{children}</WebAuthSessionProvider>
      </body>
    </html>
  );
}
