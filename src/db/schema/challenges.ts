// @/db/schema/challenges.ts
import { relations } from "drizzle-orm"
import {
  boolean,
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  uuid,
} from "drizzle-orm/pg-core"
import { challengeTypeEnum } from "@/db/schema/types"
import { exercises } from "@/db/schema/courses"

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id")
    .references(() => exercises.id, { onDelete: "cascade" })
    .notNull(),
  challengeType: challengeTypeEnum("challenge_type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  image: text("image"),
  audio: text("audio"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(), // Now uses the imported uuid type
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const challengesRelations = relations(challenges, ({ one, many }) => ({
  exercise: one(exercises, {
    fields: [challenges.exerciseId],
    references: [exercises.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}))

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
)

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
)
