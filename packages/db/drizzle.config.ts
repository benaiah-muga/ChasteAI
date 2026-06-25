import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/schemas/index.ts",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://benaiah@localhost:5432/chasteai",
  },
  verbose: true,
  strict: true,
})
