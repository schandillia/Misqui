// Contains all the database table schema definitions for Drizzle ORM.

import { relations } from "drizzle-orm"
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  index,
  serial,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

/**
 * Users table definition.
 * Stores user profile information.
 */
export const users = pgTable("user", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull().default("Student"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image").notNull().default("/mascot.svg"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

/**
 * Accounts table definition.
 * Stores linked accounts for users (e.g., OAuth providers).
 * Based on Auth.js adapter schema.
 */
export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    // Add index for faster lookups on providerAccountId
    index("providerAccountId_index").on(account.providerAccountId),
  ]
)

/**
 * Sessions table definition.
 * Stores user session information for authentication.
 * Based on Auth.js adapter schema.
 */
export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  // Add index for faster lookups on expires
  (session) => [index("expires_index").on(session.expires)]
)

/**
 * Authenticators table definition.
 * Stores authenticator information for WebAuthn.
 * Based on Auth.js adapter schema.
 */
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(), // Link to the account? Check Auth docs if this is needed/correct
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"), // e.g. "internal,hybrid"
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
  ]
)

/**
 * Courses table definition.
 * Stores course information for the learning app (e.g., "Chess", "Sudoku").
 */
export const courses = pgTable(
  "course",
  {
    id: serial("id").primaryKey().notNull(),
    title: text("title").notNull(),
    image: text("image").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (course) => [index("title_index").on(course.title)] // Index for faster title searches
)

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
}))

/**
 * User progress table definition.
 * Stores user progress in courses.
 */
export const userProgress = pgTable("userProgress", {
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeCourseId: integer("activeCourseId").references(() => courses.id, {
    onDelete: "cascade",
  }),
  gems: integer("gems").notNull().default(5),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}))
