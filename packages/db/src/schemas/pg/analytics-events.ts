import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
})
