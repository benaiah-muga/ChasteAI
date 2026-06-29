import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const workspaces = sqliteTable("workspaces", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  timezone: text("timezone").default("UTC"),
  settings: jsonText<Record<string, unknown>>("settings").default({}),
  deletedAt: text("deleted_at"),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
