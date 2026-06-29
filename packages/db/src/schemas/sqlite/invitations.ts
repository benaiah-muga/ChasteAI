import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import { id, timestampNow } from "./helpers"

export const invitationStatuses = ["pending", "accepted", "expired", "revoked"] as const
export type InvitationStatus = (typeof invitationStatuses)[number]

export const invitations = sqliteTable("invitations", {
  id: id(),
  workspaceId: text("workspace_id").notNull(),
  email: text("email").notNull(),
  invitedByUserId: text("invited_by_user_id").notNull(),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().$type<InvitationStatus>().default("pending"),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  acceptedAt: text("accepted_at"),
  createdAt: timestampNow("created_at"),
  updatedAt: timestampNow("updated_at"),
})
