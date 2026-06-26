import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow, jsonText } from "./helpers"

export const analyticsEvents = sqliteTable("analytics_events", {
  id: id(),
  workspaceId: text("workspace_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonText<Record<string, unknown>>("payload").default({}),
  timestamp: timestampNow("timestamp"),
})
