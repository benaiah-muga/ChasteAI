"use server"

import { hash, compare } from "bcryptjs"
import { eq, sql } from "drizzle-orm"
import { getDatabaseClient, user } from "@chaste-ai/db"
import { signIn } from "@/auth"
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

  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) return { error: "Sign in failed after account creation" }

  redirect("/dashboard")
}

export async function signinAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Email and password are required" }

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

  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) return { error: "Invalid email or password" }

  redirect("/dashboard")
}
