"use server"

import { eq, and, inArray } from "drizzle-orm"
import { getDatabaseClient, user, memberships } from "@chaste-ai/db"
import { auth } from "@/auth"
import { z } from "zod"

const approveSchema = z.object({
  userId: z.string().min(1),
  workspaceId: z.string().min(1),
  role: z.enum(["admin", "member"]),
})

export async function approveUserAction(data: z.infer<typeof approveSchema>) {
  const parsed = approveSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid request" }

  const { userId, workspaceId, role } = parsed.data
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [membership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.workspaceId, workspaceId)))
    .limit(1)

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return { error: "You do not have permission to approve users" }
  }

  const [existing] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId)))
    .limit(1)

  if (existing) return { error: "User is already a member of this workspace" }

  await db.transaction(async (tx) => {
    await tx.update(user).set({ status: "active" }).where(eq(user.id, userId))
    await tx.insert(memberships).values({ workspaceId, userId, role })
  })

  return { success: true }
}

export async function denyUserAction(userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const targetWorkspaces = await db
    .select({ workspaceId: memberships.workspaceId })
    .from(memberships)
    .where(eq(memberships.userId, userId))

  const targetIds = targetWorkspaces.map((m) => m.workspaceId)
  if (targetIds.length === 0) return { error: "User is not a member of any workspace" }

  const [adminMembership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(
      and(eq(memberships.userId, session.user.id), inArray(memberships.workspaceId, targetIds)),
    )
    .limit(1)

  if (!adminMembership || (adminMembership.role !== "owner" && adminMembership.role !== "admin")) {
    return { error: "You do not have permission to deny users" }
  }

  await db.update(user).set({ status: "suspended" }).where(eq(user.id, userId))

  return { success: true }
}

export async function getPendingUsersAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [adminMembership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1)

  if (!adminMembership || (adminMembership.role !== "owner" && adminMembership.role !== "admin")) {
    return { error: "Not authorized" }
  }

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
