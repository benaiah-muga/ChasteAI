import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"

export const membershipRoles = ["admin", "owner", "member"] as const
export type MembershipRole = (typeof membershipRoles)[number]

export const memberships = sqliteTable(
  "memberships",
  {
    id: id(),
    workspaceId: text("workspace_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull().$type<MembershipRole>().default("member"),
    createdAt: timestampNow("created_at"),
  },
  (table) => ({
    workspaceUserUnique: uniqueIndex("memberships_workspace_user_unique").on(
      table.workspaceId,
      table.userId,
    ),
  }),
)
