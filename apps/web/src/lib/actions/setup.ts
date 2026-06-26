"use server"

import { hash } from "bcryptjs"
import { getDatabaseClient, detectDialect, user, agents, workspaces } from "@chaste-ai/db"
import { createClient } from "@libsql/client"
import { Pool } from "pg"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { readFileSync, existsSync, writeFileSync } from "fs"
import { resolve } from "path"

const ENV_PATH = resolve(process.cwd(), ".env")

function readEnv(): Record<string, string> {
  const env: Record<string, string> = {}
  if (!existsSync(ENV_PATH)) return env
  for (const line of readFileSync(ENV_PATH, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "")
  }
  return env
}

function writeEnvVar(key: string, value: string) {
  const env = readEnv()
  env[key] = value
  const content = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n")
  writeFileSync(ENV_PATH, content + "\n", "utf-8")
}

export async function createAccountAction(data: {
  email: string
  name: string
  password: string
}) {
  const { email, name, password } = data

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

  return { success: true }
}

export async function testDbConnectionAction(data: {
  url: string
  token?: string
}) {
  try {
    const { url, token } = data
    const dialect = detectDialect(url)

    if (dialect === "postgresql") {
      const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 })
      const client = await pool.connect()
      await client.query("SELECT 1")
      client.release()
      await pool.end()
    } else {
      const client = createClient({ url, authToken: token })
      await client.execute("SELECT 1")
      client.close()
    }

    return { success: true }
  } catch (e: any) {
    return {
      error: "Could not connect to the database.",
      details: e?.message ?? String(e),
    }
  }
}

export async function setupDbAction(data: {
  url: string
  token?: string
}) {
  try {
    const { url } = data
    const dialect = detectDialect(url)

    if (dialect === "postgresql") {
      const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 10000 })
      const client = await pool.connect()
      await client.query("SELECT 1")
      client.release()
      await pool.end()
    } else {
      const client = createClient({ url })
      await client.execute("SELECT 1")
      client.close()
    }

    writeEnvVar("DATABASE_URL", url)

    return { success: true }
  } catch (e: any) {
    return {
      error: "Could not set up the database.",
      details: e?.message ?? String(e),
    }
  }
}

export async function finalizeSetupAction(data: {
  workspaceName: string
  agentName: string
  agentDescription: string
  systemPrompt: string
  providerType: string
  apiKey: string
  baseUrl: string
  model: string
}) {
  const db = getDatabaseClient()

  try {
    const [ws] = await db
      .insert(workspaces)
      .values({
        name: data.workspaceName,
        slug: data.workspaceName.toLowerCase().replace(/\s+/g, "-"),
      })
      .returning({ id: workspaces.id })

    if (!ws) return { error: "Failed to create workspace" }

    const providerConfig: Record<string, unknown> = {
      type: data.providerType,
      model: data.model,
    }
    if (data.baseUrl) providerConfig.baseUrl = data.baseUrl
    if (data.apiKey) providerConfig.apiKey = data.apiKey

    await db.insert(agents).values({
      workspaceId: ws.id,
      name: data.agentName,
      description: data.agentDescription,
      systemPrompt: data.systemPrompt,
      providerConfig,
    })

    return { success: true }
  } catch (e: any) {
    return { error: "Failed to finalize setup.", details: e?.message ?? String(e) }
  }
}

export async function testProviderConnectionAction(data: {
  type: string
  apiKey: string
  baseUrl: string
  model: string
}) {
  try {
    const { type, apiKey, baseUrl, model } = data

    if (!apiKey) {
      return { error: "API key is required." }
    }

    const { createProvider } = await import("@chaste-ai/ai")

    const provider = createProvider({
      type,
      apiKey,
      baseUrl: baseUrl || undefined,
      model: model || "gpt-4o",
    })

    const result = await provider.testConnection()

    if (result.success) {
      return { success: true }
    }

    return {
      error: "Connection test failed. Check your API key and URL.",
      details: result.message ?? "Unknown error",
    }
  } catch (e: any) {
    return {
      error: "Could not connect to the AI provider.",
      details: e?.message ?? String(e),
    }
  }
}

export async function checkSetupCompleteAction() {
  redirect("/dashboard")
}
