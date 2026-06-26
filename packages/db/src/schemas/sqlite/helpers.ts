import { sqliteTable, text, integer, customType } from "drizzle-orm/sqlite-core"

export { sqliteTable, text, integer, customType }

export function id(name = "id") {
  return text(name).primaryKey().$defaultFn(() => crypto.randomUUID())
}

export function timestamp(name: string) {
  return text(name)
}

export function timestampNow(name: string) {
  return text(name).notNull().$defaultFn(() => new Date().toISOString())
}

export function jsonText<T>(name: string) {
  return customType<{ data: T; driverData: string }>({
    dataType: () => "text",
    toDriver: (value: T) => JSON.stringify(value),
    fromDriver: (value: string) => JSON.parse(value) as T,
  })(name)
}
