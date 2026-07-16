"use server"

import { eq } from "drizzle-orm"
import { getDatabaseClient, user, memberships } from "@chaste-ai/db"
import { auth } from "@/auth"
import { z } from "zod"

const approveSchema = z.object({
  userId: z.string().min(1),
})

export async function approveUserAction(data: z.infer<typeof approveSchema>) {
  const parsed = approveSchema.safeParse(data)
  if (!parsed.success) return { error: "Invalid request" }

  const { userId } = parsed.data
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [adminMembership] = await db
    .select({ workspaceId: memberships.workspaceId, role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1)

  if (!adminMembership || (adminMembership.role !== "admin" && adminMembership.role !== "owner")) {
    return { error: "You do not have permission to approve users" }
  }

  const workspaceId = adminMembership.workspaceId

  const [existing] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1)

  if (existing) return { error: "User is already a member" }

  await db.transaction(async (tx) => {
    await tx.update(user).set({ status: "active" }).where(eq(user.id, userId))
    await tx.insert(memberships).values({ workspaceId, userId, role: "member" })
  })

  return { success: true }
}

export async function denyUserAction(userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const db = getDatabaseClient()

  const [adminMembership] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1)

  if (!adminMembership || (adminMembership.role !== "admin" && adminMembership.role !== "owner")) {
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

  if (!adminMembership || (adminMembership.role !== "admin" && adminMembership.role !== "owner")) {
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
