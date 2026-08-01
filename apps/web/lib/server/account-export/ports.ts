import type {
  AccountExportData,
  AccountExportDocument,
  AccountExportIdentity,
} from "@thainaute/sync";

export interface AccountExportIdentityVerifier {
  verify(input: {
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }): Promise<AccountExportIdentity>;
}

export interface AccountExportRepository {
  read(input: {
    readonly userId: string;
    readonly accessToken: string;
    readonly signal: AbortSignal;
  }): Promise<AccountExportData>;
}

export type AccountExporter = (input: {
  readonly accessToken: string;
  readonly signal: AbortSignal;
}) => Promise<AccountExportDocument>;
