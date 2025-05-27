// @/db/schema/types.ts
import { pgEnum } from "drizzle-orm/pg-core"

export const challengeTypeEnum = pgEnum("type", ["SELECT", "ASSIST"])

export const themeEnum = pgEnum("theme", ["light", "dark", "system"])
export const brandColorEnum = pgEnum("brand_color", [
  "slate",
  "gray",
  "stone",
  "red",
  "rose",
  "pink",
  "fuchsia",
  "orange",
  "amber",
  "yellow",
  "violet",
  "indigo",
  "blue",
  "sky",
  "cyan",
  "lime",
  "teal",
  "emerald",
  "green",
])
