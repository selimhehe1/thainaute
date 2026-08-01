import type { ProgressSnapshotResponse } from "@thainaute/sync";

export interface ProgressSnapshotRepository {
  read(userId: string): Promise<ProgressSnapshotResponse>;
}
