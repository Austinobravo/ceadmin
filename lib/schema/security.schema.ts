// lib/schema/security.schema.ts
// Drizzle table definitions for security.db (SecurityDatabase)

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const tokens = sqliteTable("tokens", {
  token: text("token").primaryKey(),
  created_at: integer("created_at").default(sql`(strftime('%s','now'))`),
});

export const trackingCookies = sqliteTable("tracking_cookies", {
  cookie_value: text("cookie_value").primaryKey(),
  ip: text("ip").notNull(),
  created_at: integer("created_at").default(sql`(strftime('%s','now'))`),
});

export const ipLog = sqliteTable("ip_log", {
  ip: text("ip").primaryKey(),
  timestamp: integer("timestamp").notNull(),
});
