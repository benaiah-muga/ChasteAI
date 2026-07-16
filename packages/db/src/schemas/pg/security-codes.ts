import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const securityCodes = pgTable("security_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  codePrefix: text("code_prefix").notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
