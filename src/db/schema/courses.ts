// @/db/schema/courses.ts
import { relations } from "drizzle-orm"
import {
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  index,
  boolean,
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

export const lessons = pgTable("lessons", {
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

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  isTimed: boolean("is_timed").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress), // Now references the imported userProgress
  lessons: many(lessons),
}))

export const lessonsRelations = relations(lessons, ({ many, one }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  exercises: many(exercises),
}))

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
  challenges: many(challenges),
}))
