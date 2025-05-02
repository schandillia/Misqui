// @/db/schema/subscriptions.ts
import { timestamp, pgTable, text, serial, uuid } from "drizzle-orm/pg-core"

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
})
