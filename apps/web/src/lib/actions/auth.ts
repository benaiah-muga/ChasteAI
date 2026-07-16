"use server"

import { hash, compare } from "bcryptjs"
import { eq, and, isNull, sql } from "drizzle-orm"
import { getDatabaseClient, user, securityCodes } from "@chaste-ai/db"
import { signIn, auth } from "@/auth"
import { redirect } from "next/navigation"

export async function signupAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password) return { error: "Email and password are required" }
  if (password.length < 8) return { error: "Password must be at least 8 characters" }

  const db = getDatabaseClient()
  const hashed = await hash(password, 10)

  let createdUser: { id: string; status: string } | null = null

  try {
    const [created] = await db
      .insert(user)
      .values({ email, name, password: hashed, status: "pending" })
      .returning({ id: user.id, status: user.status })

    if (!created) return { error: "Failed to create user" }
    createdUser = created
  } catch (e: any) {
    if (e?.code === "23505") return { error: "An account with this email already exists" }
    return { error: "Failed to create user. Please try again." }
  }

  const updated = await db
    .update(user)
    .set({ status: "active" })
    .where(
      sql`${user.id} = ${createdUser.id} AND NOT EXISTS (SELECT 1 FROM "user" WHERE status = 'active')`,
    )
    .returning({ status: user.status })

  const firstRow = Array.isArray(updated) ? updated[0] : updated
  const isFirstUser = firstRow?.status === "active"

  if (!isFirstUser) {
    redirect("/pending-approval")
  }

  try {
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) return { error: "Sign in failed after account creation" }
  } catch (e: any) {
    if (e?.message === "NEXT_REDIRECT") throw e
    return { error: "Sign in failed after account creation" }
  }

  redirect("/dashboard")
}

export async function signinAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Email and password are required" }
  if (password === "__recovery__") return { error: "Invalid email or password" }

  const db = getDatabaseClient()
  const [found] = await db
    .select({ password: user.password, status: user.status })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (!found) return { error: "Invalid email or password" }

  const valid = await compare(password, found.password ?? "")
  if (!valid) return { error: "Invalid email or password" }

  if (found.status === "pending") {
    return {
      error: "Your account is pending approval. Please wait for an admin to approve your account.",
    }
  }

  if (found.status === "suspended") {
    return { error: "Your account has been suspended. Please contact your administrator." }
  }

  try {
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) return { error: "Invalid email or password" }
  } catch (e: any) {
    if (e?.message === "NEXT_REDIRECT") throw e
    return { error: "Invalid email or password" }
  }

  redirect("/dashboard")
}

export async function verifySecurityCodeAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string
  const code = formData.get("code") as string

  if (!email || !code) return { error: "Email and security code are required" }

  const db = getDatabaseClient()
  const [found] = await db
    .select({ id: user.id, status: user.status })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (!found) return { error: "Invalid email or security code" }

  const unusedCodes = await db
    .select()
    .from(securityCodes)
    .where(and(eq(securityCodes.userId, found.id), isNull(securityCodes.usedAt)))

  let matched = false
  for (const sc of unusedCodes) {
    const valid = await compare(code, sc.codeHash)
    if (valid) {
      await db.update(securityCodes).set({ usedAt: new Date() }).where(eq(securityCodes.id, sc.id))
      matched = true
      break
    }
  }

  if (!matched) return { error: "Invalid email or security code" }

  try {
    const result = await signIn("credentials", { email, password: "__recovery__", redirect: false })
    if (result?.error) return { error: "Sign in failed" }
  } catch (e: any) {
    if (e?.message === "NEXT_REDIRECT") throw e
    return { error: "Sign in failed" }
  }

  redirect("/dashboard?recovery=1")
}

export async function changePasswordAction(data: { currentPassword: string; newPassword: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const { currentPassword, newPassword } = data
  if (!currentPassword || !newPassword) return { error: "Current and new passwords are required" }
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters" }

  const db = getDatabaseClient()
  const [found] = await db
    .select({ password: user.password })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!found) return { error: "User not found" }

  let valid = false

  if (found.password) {
    valid = await compare(currentPassword, found.password)
  }

  if (!valid) {
    const unusedCodes = await db
      .select()
      .from(securityCodes)
      .where(and(eq(securityCodes.userId, session.user.id), isNull(securityCodes.usedAt)))

    for (const sc of unusedCodes) {
      if (await compare(currentPassword, sc.codeHash)) {
        valid = true
        await db
          .update(securityCodes)
          .set({ usedAt: new Date() })
          .where(eq(securityCodes.id, sc.id))
        break
      }
    }
  }

  if (!valid) return { error: "Current password or security code is incorrect" }

  const hashed = await hash(newPassword, 10)
  await db.update(user).set({ password: hashed }).where(eq(user.id, session.user.id))

  return { success: true }
}
