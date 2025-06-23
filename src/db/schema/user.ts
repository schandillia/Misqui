import { relations } from "drizzle-orm"
import {
  timestamp,
  pgTable,
  text,
  integer,
  serial,
  boolean,
  uuid,
  date,
  primaryKey,
} from "drizzle-orm/pg-core"
import app from "@/lib/data/app.json"
import {
  brandColorEnum,
  genderEnum,
  roleEnum,
  themeEnum,
} from "@/db/schema/types"
import { courses, drills } from "@/db/schema/course-content"
import { accounts, authenticators, sessions } from "@/db/schema/auth"

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull().default("Student"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image").notNull().default("/images/mascots/mascot.svg"),
  gender: genderEnum("gender"),
  birthdate: timestamp("birthdate", { mode: "date" }),
  soundEnabled: boolean("sound_enabled").notNull().default(true),
  theme: themeEnum("theme").notNull().default("system"),
  brandColor: brandColorEnum("brand_color")
    .notNull()
    .default(app.BRAND_COLOR as (typeof brandColorEnum.enumValues)[number]),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Stats Table
export const stats = pgTable("stats", {
  userId: uuid("user_id")
    .notNull()
    .primaryKey()
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

// User Subscription Table
export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// User Drill Completion Table
export const userDrillCompletion = pgTable(
  "user_drill_completion",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    currentDrillId: integer("current_drill_id")
      .notNull()
      .references(() => drills.id, { onDelete: "cascade" }),
    questionsCompleted: integer("questions_completed").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })]
)

// User Course Completion Table
export const userCourseCompletion = pgTable("user_course_completion", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Relations
export const statsRelations = relations(stats, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [stats.activeCourseId],
    references: [courses.id],
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  stats: many(stats),
  userSubscription: many(userSubscription),
  userDrillCompletion: many(userDrillCompletion),
}))

export const userSubscriptionRelations = relations(
  userSubscription,
  ({ one }) => ({
    user: one(users, {
      fields: [userSubscription.userId],
      references: [users.id],
    }),
  })
)

export const userDrillCompletionRelations = relations(
  userDrillCompletion,
  ({ one }) => ({
    user: one(users, {
      fields: [userDrillCompletion.userId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [userDrillCompletion.courseId],
      references: [courses.id],
    }),
    currentDrill: one(drills, {
      fields: [userDrillCompletion.currentDrillId],
      references: [drills.id],
    }),
  })
)

export const userCourseCompletionRelations = relations(
  userCourseCompletion,
  ({ one }) => ({
    user: one(users, {
      fields: [userCourseCompletion.userId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [userCourseCompletion.courseId],
      references: [courses.id],
    }),
  })
)
