import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schemas"

let _db: NodePgDatabase<typeof schema> | null = null

export function createDatabaseClient(connectionString?: string) {
  const url = connectionString ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
        "Set it to your PostgreSQL connection string."
    )
  }
  const pool = new Pool({ connectionString: url })
  return drizzle(pool, { schema })
}

export function getDatabaseClient(connectionString?: string) {
  if (!_db) {
    _db = createDatabaseClient(connectionString)
  }
  return _db
}

export type DatabaseClient = NodePgDatabase<typeof schema>
