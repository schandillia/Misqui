import { stats, userDrillCompletion } from "@/db/schema/user"
import { relations } from "drizzle-orm"
import {
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  index,
  boolean,
  unique,
} from "drizzle-orm/pg-core"

// Courses Table
export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    badge: text("badge").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (course) => [index("title_index").on(course.title)]
)

// Units Table
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  unitNumber: integer("unit_number").notNull(),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Drills Table
export const drills = pgTable(
  "drills",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    unitId: integer("unit_id")
      .references(() => units.id, { onDelete: "cascade" })
      .notNull(),
    order: integer("order").notNull(),
    drillNumber: integer("drill_number").notNull(),
    isTimed: boolean("is_timed").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("unit_drill_number_unique").on(table.unitId, table.drillNumber),
  ]
)

// Questions Table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  drillId: integer("drill_id")
    .references(() => drills.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  option1: text("option_1").notNull(),
  option2: text("option_2").notNull(),
  option3: text("option_3").notNull(),
  option4: text("option_4").notNull(),
  correctOption: integer("correct_option").notNull(), // should be "1", "2", "3", or "4"
  explanation: text("explanation"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  stats: many(stats),
  units: many(units),
  userDrillCompletion: many(userDrillCompletion),
}))

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  drills: many(drills),
}))

export const drillsRelations = relations(drills, ({ one, many }) => ({
  unit: one(units, {
    fields: [drills.unitId],
    references: [units.id],
  }),
  questions: many(questions),
}))

export const questionsRelations = relations(questions, ({ one }) => ({
  drill: one(drills, {
    fields: [questions.drillId],
    references: [drills.id],
  }),
}))
