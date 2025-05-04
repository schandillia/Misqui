import {
  pgTable,
  serial,
  uuid,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const userLessonChallengeSubset = pgTable(
  "user_lesson_challenge_subset",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lessonId: integer("lesson_id").notNull(),
    challengeIds: text("challenge_ids").notNull(), // JSON string of challenge IDs
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  }
)
