"use server"

import { eq, and } from "drizzle-orm"
import { getDatabaseClient, user, memberships } from "@chaste-ai/db"
import { auth } from "@/auth"

export async function approveUserAction(data: {
  userId: string
  workspaceId: string
  role: "admin" | "member"
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(
      and(eq(memberships.userId, session.user.id), eq(memberships.workspaceId, data.workspaceId)),
    )
    .limit(1)

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { error: "You do not have permission to approve users" }
  }

  const [existing] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, data.userId), eq(memberships.workspaceId, data.workspaceId)))
    .limit(1)

  if (existing) return { error: "User is already a member of this workspace" }

  await db.update(user).set({ status: "active" }).where(eq(user.id, data.userId))

  await db.insert(memberships).values({
    workspaceId: data.workspaceId,
    userId: data.userId,
    role: data.role,
  })

  return { success: true }
}

export async function denyUserAction(userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1)

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { error: "You do not have permission to deny users" }
  }

  await db.update(user).set({ status: "suspended" }).where(eq(user.id, userId))

  return { success: true }
}

export async function getPendingUsersAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const pending = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.status, "pending"))
    .orderBy(user.createdAt)

  return { users: pending }
}

export async function getAdminWorkspacesAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()
  const { workspaces: workspacesTable } = await import("@chaste-ai/db")

  const result = await db
    .select({
      id: workspacesTable.id,
      name: workspacesTable.name,
    })
    .from(memberships)
    .innerJoin(workspacesTable, eq(workspacesTable.id, memberships.workspaceId))
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.role, "owner")))

  return { workspaces: result }
}
