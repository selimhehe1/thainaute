import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource/noto-sans-thai/thai-400.css";
import "@fontsource/noto-sans-thai/thai-600.css";

import { WebAuthSessionProvider } from "@/lib/client/auth-session";
import { WebAccountDeletionBootstrap } from "@/lib/client/account-deletion-bootstrap";
import { createSiteMetadata } from "@/lib/server/site-metadata";

import "./globals.css";

export function generateMetadata(): Metadata {
  return createSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <WebAuthSessionProvider>
          <WebAccountDeletionBootstrap />
          {children}
        </WebAuthSessionProvider>
      </body>
    </html>
  );
}
