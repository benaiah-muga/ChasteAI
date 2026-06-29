import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core"
import { workspaces } from "./workspaces"

export const invitationStatuses = ["pending", "accepted", "expired", "revoked"] as const
export type InvitationStatus = (typeof invitationStatuses)[number]

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  invitedByUserId: text("invited_by_user_id").notNull(),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().$type<InvitationStatus>().default("pending"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
