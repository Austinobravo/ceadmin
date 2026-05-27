// lib/schema/config.schema.ts
// Drizzle table definitions for config.db (ConfigDatabase)

import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});
