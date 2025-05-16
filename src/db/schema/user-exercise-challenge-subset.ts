import {
  pgTable,
  serial,
  uuid,
  integer,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const userExerciseChallengeSubset = pgTable(
  "user_exercise_challenge_subset",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    challengeIds: text("challenge_ids").notNull(),
    purpose: text("purpose", { enum: ["exercise", "practice"] }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userExercisePurposeIdx: uniqueIndex("user_exercise_purpose_idx").on(
      table.userId,
      table.exerciseId,
      table.purpose
    ),
  })
)
