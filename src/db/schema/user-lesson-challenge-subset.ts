import {
  pgTable,
  serial,
  uuid,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const userLessonChallengeSubset = pgTable(
  "user_lesson_challenge_subset",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    lessonId: integer("lesson_id").notNull(),
    challengeIds: text("challenge_ids").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userLessonIdx: uniqueIndex("user_lesson_idx").on(
      table.userId,
      table.lessonId
    ),
  })
)
