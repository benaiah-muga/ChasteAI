import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"

export const membershipRoles = ["owner", "admin", "member"] as const
export type MembershipRole = (typeof membershipRoles)[number]

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: text("role").notNull().$type<MembershipRole>().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    workspaceUserUnique: uniqueIndex("memberships_workspace_user_unique").on(
      table.workspaceId,
      table.userId,
    ),
  }),
)
