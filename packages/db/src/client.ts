import { drizzle as pgDrizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { drizzle as libsqlDrizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { Pool } from "pg"
import * as pgSchema from "./schemas/pg"
import * as sqliteSchema from "./schemas/sqlite"

export type PgDb = NodePgDatabase<typeof pgSchema>
export type SqliteDb = LibSQLDatabase<typeof sqliteSchema>
export type AnyDb = PgDb | SqliteDb

let _pgDb: PgDb | null = null

export function detectDialect(url: string): "postgresql" | "sqlite" {
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return "postgresql"
  }
  return "sqlite"
}

export function createClientForDialect(connectionString: string): AnyDb {
  const dialect = detectDialect(connectionString)
  if (dialect === "postgresql") {
    const pool = new Pool({ connectionString })
    return pgDrizzle(pool, { schema: pgSchema })
  }
  const client = createClient({ url: connectionString })
  return libsqlDrizzle(client, { schema: sqliteSchema })
}

export function getDatabaseClient(connectionString?: string): PgDb {
  const url = connectionString ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
        "Set it to your PostgreSQL database connection string."
    )
  }
  if (detectDialect(url) === "sqlite") {
    throw new Error(
      "SQLite databases are only supported during setup. " +
      "Use createClientForDialect() for SQLite connections from setup actions."
    )
  }
  if (!_pgDb) {
    const pool = new Pool({ connectionString: url })
    _pgDb = pgDrizzle(pool, { schema: pgSchema })
  }
  return _pgDb
}

export type DatabaseClient = PgDb
