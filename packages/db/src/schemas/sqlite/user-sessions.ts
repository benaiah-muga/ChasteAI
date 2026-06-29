import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"
import { user } from "./auth"

export const userSessions = sqliteTable("user_sessions", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  deviceName: text("device_name"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  ipAddress: text("ip_address"),
  location: text("location"),
  isRevoked: integer("is_revoked").notNull().default(0),
  lastActiveAt: timestampNow("last_active_at"),
  createdAt: timestampNow("created_at"),
  expiresAt: text("expires_at").notNull(),
})
