import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core"
import type { InferSelectModel } from "drizzle-orm"
import { timestamp, timestampNow } from "./helpers"

export const userStatuses = ["active", "pending", "suspended"] as const
export type UserStatus = (typeof userStatuses)[number]

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  password: text("password"),
  status: text("status").notNull().$type<UserStatus>().default("pending"),
  theme: text("theme").default("system"),
  density: text("density").default("comfortable"),
  createdAt: timestampNow("created_at"),
})

export const session = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
})

export const account = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: text("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
  }),
)

export const verificationToken = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
)

export type User = InferSelectModel<typeof user>
export type Session = InferSelectModel<typeof session>
export type Account = InferSelectModel<typeof account>
