import { relations } from "drizzle-orm";
import { pgTable, timestamp, primaryKey, integer, text } from "drizzle-orm/pg-core";

export const userTimedExerciseCompletions = pgTable(
  "user_timed_exercise_completions",
  {
    userId: text("user_id") // Changed from integer to text. Reference temporarily removed.
      // .references(() => users.id, { onDelete: "cascade" }) 
      .notNull(),
    exerciseId: integer("exercise_id") // Reference temporarily removed.
      // .references(() => exercises.id, { onDelete: "cascade" })
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.exerciseId] }),
  })
);

// Relations definition temporarily commented out until schema paths are confirmed
// export const userTimedExerciseCompletionsRelations = relations(
//   userTimedExerciseCompletions,
//   ({ one }) => ({
//     user: one(users, {
//       fields: [userTimedExerciseCompletions.userId],
//       references: [users.id],
//     }),
//     exercise: one(exercises, {
//       fields: [userTimedExerciseCompletions.exerciseId],
//       references: [exercises.id],
//     }),
//   })
// );
