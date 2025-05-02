// @/db/schema/types.ts
import { pgEnum } from "drizzle-orm/pg-core"

export const challengeTypeEnum = pgEnum("type", ["SELECT", "ASSIST"])
