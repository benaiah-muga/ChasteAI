import { config } from "dotenv"
import { resolve } from "path"
import { hash } from "bcryptjs"
import { getDatabaseClient } from "./client"
import { user, workspaces, memberships } from "./schemas"

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
    role: "owner",
  })

  console.log("Seed complete. Sign in with admin@chasteai.dev / password123")
  process.exit(0)
}

seed().catch((e) => {
  console.error("Seed failed:", e)
  process.exit(1)
})
