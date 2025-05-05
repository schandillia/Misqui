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
    purpose: text("purpose", { enum: ["lesson", "practice"] }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userLessonPurposeIdx: uniqueIndex("user_lesson_purpose_idx").on(
      table.userId,
      table.lessonId,
      table.purpose
    ),
  })
)
