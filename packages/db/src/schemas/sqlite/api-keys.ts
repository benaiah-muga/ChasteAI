import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestamp, timestampNow, jsonText } from "./helpers"

export const apiKeyScopes = ["read", "write", "admin"] as const
export type ApiKeyScope = (typeof apiKeyScopes)[number]

export const apiKeys = sqliteTable("api_keys", {
  id: id(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  scopes: jsonText<ApiKeyScope[]>("scopes").notNull(),
  expiresAt: timestamp("expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestampNow("created_at"),
})
