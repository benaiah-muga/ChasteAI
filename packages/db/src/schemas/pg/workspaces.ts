import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  timezone: text("timezone").default("UTC"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
