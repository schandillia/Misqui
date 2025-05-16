import {
  pgTable,
  serial,
  uuid,
  integer,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const userExerciseChallengeSubset = pgTable(
  "user_exercise_challenge_subset",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    exerciseId: integer("exercise_id").notNull(),
    challengeIds: text("challenge_ids").notNull(),
    isPractice: boolean("is_practice").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userExerciseIsPracticeIdx: uniqueIndex("user_exercise_is_practice_idx").on(
      table.userId,
      table.exerciseId,
      table.isPractice
    ),
  })
)
