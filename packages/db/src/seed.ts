import { config } from "dotenv"
import { resolve } from "path"
import { hash } from "bcryptjs"
import { getDatabaseClient } from "./client"
import { user, workspaces, memberships, agents, channels } from "./schemas"

config({ path: resolve(process.cwd(), "../../apps/web/.env") })

async function seed() {
  const db = getDatabaseClient()

  const existingUser = await db.select().from(user).limit(1)
  if (existingUser.length > 0) {
    console.log("Database already has data, skipping seed.")
    process.exit(0)
  }

  const password = await hash("password123", 10)

  const [devUser] = await db
    .insert(user)
    .values({
      email: "admin@chasteai.dev",
      name: "Admin",
      password,
      status: "active",
    })
    .returning()

  if (!devUser) {
    throw new Error("Failed to create seed user")
  }

  console.log(`Created user: ${devUser.email} (id: ${devUser.id})`)

  const [ws] = await db
    .insert(workspaces)
    .values({
      name: "My Workspace",
      slug: "my-workspace",
    })
    .returning()

  if (!ws) {
    throw new Error("Failed to create seed workspace")
  }

  console.log(`Created workspace: ${ws.name} (slug: ${ws.slug})`)

  await db.insert(memberships).values({
    workspaceId: ws.id,
    userId: devUser.id,
    role: "admin",
  })

  const [supportAgent] = await db
    .insert(agents)
    .values({
      workspaceId: ws.id,
      name: "Support Bot",
      description: "General customer support assistant",
      systemPrompt:
        "You are a helpful customer support agent. Answer questions politely and accurately.",
      status: "active",
      providerConfig: {
        type: "openai",
        model: "gpt-4o-mini",
      },
    })
    .returning()

  if (!supportAgent) {
    throw new Error("Failed to create seed agent")
  }

  console.log(`Created agent: ${supportAgent.name} (id: ${supportAgent.id})`)

  const [salesAgent] = await db
    .insert(agents)
    .values({
      workspaceId: ws.id,
      name: "Sales Assistant",
      description: "Handles sales inquiries and product questions",
      systemPrompt:
        "You are a knowledgeable sales representative. Focus on helping customers find the right products.",
      status: "active",
      providerConfig: {
        type: "openai",
        model: "gpt-4o-mini",
      },
    })
    .returning()

  if (!salesAgent) {
    throw new Error("Failed to create sales agent")
  }

  console.log(`Created agent: ${salesAgent.name} (id: ${salesAgent.id})`)

  await db.insert(channels).values({
    agentId: supportAgent.id,
    type: "widget",
    name: "Website Widget",
    isActive: "true",
    config: {
      title: "Chat with Support",
      greeting: "Hi! How can we help you today?",
      color: "#6366f1",
      agentName: "Support Bot",
    },
  })

  await db.insert(channels).values({
    agentId: supportAgent.id,
    type: "web",
    name: "Dashboard Chat",
    isActive: "true",
    config: {},
  })

  await db.insert(channels).values({
    agentId: salesAgent.id,
    type: "api",
    name: "Sales API",
    isActive: "true",
    config: {},
  })

  console.log("Created 3 sample channels")
  console.log("Seed complete. Sign in with admin@chasteai.dev / password123")
  process.exit(0)
}

seed().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
