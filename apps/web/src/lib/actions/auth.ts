"use server"

import { hash } from "bcryptjs"
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

  try {
    const [created] = await db
      .insert(user)
      .values({ email, name, password: hashed })
      .returning({ id: user.id })

    if (!created) return { error: "Failed to create user" }
  } catch (e: any) {
    if (e?.code === "23505") return { error: "An account with this email already exists" }
    return { error: "Failed to create user. Please try again." }
  }

  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) return { error: "Sign in failed after account creation" }

  redirect("/dashboard")
}

export async function signinAction(_prevState: { error: string }, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Email and password are required" }

  const result = await signIn("credentials", { email, password, redirect: false })

  if (result?.error) return { error: "Invalid email or password" }

  redirect("/dashboard")
}
