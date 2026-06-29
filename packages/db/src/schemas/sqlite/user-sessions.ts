import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"

export const userSessions = sqliteTable("user_sessions", {
  id: id(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  deviceName: text("device_name"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  ipAddress: text("ip_address"),
  location: text("location"),
  isRevoked: text("is_revoked").notNull().default("false"),
  lastActiveAt: timestampNow("last_active_at"),
  createdAt: timestampNow("created_at"),
  expiresAt: text("expires_at").notNull(),
})
