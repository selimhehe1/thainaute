import type { ProgressSnapshotResponse } from "@thainaute/sync";

export interface ProgressSnapshotRepository {
  read(userId: string): Promise<ProgressSnapshotResponse>;
}

/**
 * Lecture dédiée à la preview de leçon : un compte Auth neuf peut ne pas
 * posséder encore de profil, auquel cas son état initial est explicitement
 * vide. Le snapshot générique conserve son contrat strict et refuse ce cas.
 */
export interface LessonProgressSnapshotRepository extends ProgressSnapshotRepository {
  readForLesson(userId: string): Promise<ProgressSnapshotResponse>;
}
