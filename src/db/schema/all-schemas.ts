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
  uuid,
  date,
  primaryKey,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
import app from "@/lib/data/app.json"
import { brandColorEnum, genderEnum, themeEnum } from "@/db/schema/types"

// Subjects Table
export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (subject) => [index("title_index").on(subject.title)]
)

// Units Table
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .references(() => subjects.id, { onDelete: "cascade" })
    .notNull(),
  unit_number: integer("unit_number").notNull(),
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
    drill_number: integer("drill_number").notNull(),
    isTimed: boolean("is_timed").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    unique("unit_drill_number_unique").on(table.unitId, table.drill_number),
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
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})

// Stats Table
export const stats = pgTable("stats", {
  userId: uuid("user_id").primaryKey().notNull(),
  activeSubjectId: integer("active_subject_id").references(() => subjects.id, {
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

// Accounts Table
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index("providerAccountId_index").on(account.providerAccountId),
  ]
)

// Sessions Table
export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (session) => [index("expires_index").on(session.expires)]
)

// Authenticators Table
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
  ]
)

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
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    currentDrillId: integer("current_drill_id")
      .notNull()
      .references(() => drills.id, { onDelete: "cascade" }),
    questionsCompleted: integer("questions_completed").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.subjectId] })]
)

// Relations
export const subjectsRelations = relations(subjects, ({ many }) => ({
  stats: many(stats),
  units: many(units),
  userDrillCompletion: many(userDrillCompletion),
}))

export const unitsRelations = relations(units, ({ many, one }) => ({
  subject: one(subjects, {
    fields: [units.subjectId],
    references: [subjects.id],
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

export const statsRelations = relations(stats, ({ one }) => ({
  activeSubject: one(subjects, {
    fields: [stats.activeSubjectId],
    references: [subjects.id],
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

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
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
    subject: one(subjects, {
      fields: [userDrillCompletion.subjectId],
      references: [subjects.id],
    }),
    currentDrill: one(drills, {
      fields: [userDrillCompletion.currentDrillId],
      references: [drills.id],
    }),
  })
)
