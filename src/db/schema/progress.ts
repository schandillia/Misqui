// @/db/schema/progress.ts
import { relations } from "drizzle-orm"
import { timestamp, pgTable, integer, uuid, date } from "drizzle-orm/pg-core"
import app from "@/lib/data/app.json"
import { courses } from "@/db/schema/courses"
import { users } from "@/db/schema/auth"

export const userProgress = pgTable("user_progress", {
  userId: uuid("user_id")
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  gems: integer("gems").notNull().default(app.GEMS_LIMIT),
  points: integer("points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}))
