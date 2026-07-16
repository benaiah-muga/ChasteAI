import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"
import { user } from "./auth"

export const securityCodes = sqliteTable("security_codes", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  codePrefix: text("code_prefix").notNull(),
  usedAt: text("used_at"),
  createdAt: timestampNow("created_at"),
})
