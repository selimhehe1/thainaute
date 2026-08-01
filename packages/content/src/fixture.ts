import lessonJson from "../data/lessons/unicode-audio-fixture.v1.json";

import { lessonSchema } from "./schemas";

/** Fixture embarquable, sans accès disque ni données linguistiques publiables. */
export const fixtureLesson = lessonSchema.parse(lessonJson);
