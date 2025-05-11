// @/db/schema/courses.ts
import { relations } from "drizzle-orm"
import {
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  index,
} from "drizzle-orm/pg-core"
import { userProgress } from "@/db/schema/progress"
import { challenges } from "@/db/schema/challenges"

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (course) => [index("title_index").on(course.title)]
)

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress), // Now references the imported userProgress
  units: many(units),
}))

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}))

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}))
