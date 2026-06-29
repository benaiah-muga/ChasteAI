import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  isRevoked: boolean("is_revoked").notNull().default(false),
  lastActiveAt: timestamp("last_active_at", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
})
