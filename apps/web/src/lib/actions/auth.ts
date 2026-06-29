"use server"

import { hash } from "bcryptjs"
import { eq, count } from "drizzle-orm"
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

  const countResult = await db.select({ count: count() }).from(user)
  const existing = countResult[0]?.count ?? 0

  const hashed = await hash(password, 10)

  let createdUser: { id: string; status: string } | null = null

  try {
    const [created] = await db
      .insert(user)
      .values({ email, name, password: hashed, status: existing === 0 ? "active" : "pending" })
      .returning({ id: user.id, status: user.status })

    if (!created) return { error: "Failed to create user" }
    createdUser = created
  } catch (e: any) {
    if (e?.code === "23505") return { error: "An account with this email already exists" }
    return { error: "Failed to create user. Please try again." }
  }

  if (createdUser.status === "pending") {
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
    .select({ status: user.status })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (found && found.status === "pending") {
    return {
      error: "Your account is pending approval. Please wait for an admin to approve your account.",
    }
  }

  if (found && found.status === "suspended") {
    return { error: "Your account has been suspended. Please contact your administrator." }
  }

  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) return { error: "Invalid email or password" }

  redirect("/dashboard")
}
