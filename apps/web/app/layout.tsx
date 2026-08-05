import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/manrope/index.css";
import "@fontsource/noto-sans-thai/thai-400.css";
import "@fontsource/noto-sans-thai/thai-600.css";
import "@thainaute/design-tokens/tokens.css";

import { WebAuthSessionProvider } from "@/lib/client/auth-session";
import { WebAccountDeletionBootstrap } from "@/lib/client/account-deletion-bootstrap";
import { WebAttemptSyncBootstrap } from "@/lib/client/attempt-sync-bootstrap";
import { WebAnalyticsConsentProvider } from "@/lib/client/analytics-consent";
import { createSiteMetadata } from "@/lib/server/site-metadata";

import "./styles/base.css";

export function generateMetadata(): Metadata {
  return createSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body>
        <WebAnalyticsConsentProvider>
          <WebAuthSessionProvider>
            <WebAccountDeletionBootstrap />
            <WebAttemptSyncBootstrap />
            {children}
          </WebAuthSessionProvider>
        </WebAnalyticsConsentProvider>
      </body>
    </html>
  );
}
