import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core"

export const apiKeyScopes = ["read", "write", "admin"] as const
export type ApiKeyScope = (typeof apiKeyScopes)[number]

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  scopes: jsonb("scopes").$type<ApiKeyScope[]>().notNull(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
