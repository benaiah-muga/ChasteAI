import { intro, outro, select, text, password, spinner, log, isCancel, cancel } from "@clack/prompts"
import { createClient } from "@libsql/client"
import { readFileSync, existsSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, "..")
const ENV_PATH = resolve(PROJECT_ROOT, "apps/web/.env")
const MIGRATIONS_PATH = resolve(PROJECT_ROOT, "packages/db/src/migrations-sqlite/0000_init.sql")

async function main() {
  intro("ChasteAI — Database Setup")

  const dbType = await select({
    message: "Choose a database:",
    options: [
      {
        value: "sqlite",
        label: "SQLite",
        hint: "quick start — local file, zero config",
      },
      {
        value: "turso",
        label: "Turso",
        hint: "edge — sync to remote, same libSQL engine",
      },
    ],
  })

  if (isCancel(dbType)) {
    cancel("Setup cancelled.")
    process.exit(0)
  }

  let dbUrl: string

  if (dbType === "turso") {
    const tursoUrl = await text({
      message: "Enter your Turso database URL:",
      placeholder: "libsql://my-db.turso.io",
      validate: (v) => {
        if (!v.startsWith("libsql://")) return "URL must start with libsql://"
      },
    })
    if (isCancel(tursoUrl)) {
      cancel("Setup cancelled.")
      process.exit(0)
    }

    const tursoToken = await password({
      message: "Enter your Turso auth token:",
      validate: (v) => {
        if (!v || v.length === 0) return "Token is required"
      },
    })
    if (isCancel(tursoToken)) {
      cancel("Setup cancelled.")
      process.exit(0)
    }

    dbUrl = tursoUrl as string
    process.env.TURSO_AUTH_TOKEN = tursoToken as string
  } else {
    const dataDir = resolve(PROJECT_ROOT, "data")
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    dbUrl = `file:${dataDir}/chasteai.db`
  }

  const s = spinner()
  s.start("Connecting to database...")

  try {
    const client = createClient({ url: dbUrl })

    const result = await client.execute("SELECT 1")
    s.stop("Connected successfully")

    s.start("Running migrations...")
    const sql = readFileSync(MIGRATIONS_PATH, "utf-8")
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const stmt of statements) {
      await client.execute(stmt)
    }
    client.close()
    s.stop("Migrations complete")

    log.success("Database is ready")

    let envContent = ""
    if (existsSync(ENV_PATH)) {
      envContent = readFileSync(ENV_PATH, "utf-8")
      envContent = envContent
        .split("\n")
        .filter((line) => !line.startsWith("DATABASE_URL=") && !line.startsWith("TURSO_AUTH_TOKEN="))
        .join("\n")
        .trim()
      if (envContent.length > 0) envContent += "\n"
    }

    envContent += `DATABASE_URL=${dbUrl}\n`
    if (dbType === "turso") {
      envContent += `TURSO_AUTH_TOKEN=${process.env.TURSO_AUTH_TOKEN}\n`
    }

    const { writeFileSync } = await import("fs")
    writeFileSync(ENV_PATH, envContent, "utf-8")
    log.success("Environment configured")

    const setupUrl = `http://localhost:3000/setup`

    outro(
      `Setup complete!\n\n` +
        `  Open this URL in your browser to continue:\n` +
        `  ${setupUrl}\n\n` +
        `  Then run:  pnpm dev`
    )
  } catch (e) {
    s.stop("Setup failed")
    log.error(String(e))
    process.exit(1)
  }
}

main()
