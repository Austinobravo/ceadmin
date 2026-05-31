import { sql } from "drizzle-orm";
import { db } from "./db";

async function reset() {
  await db.run(sql`PRAGMA foreign_keys = OFF`);

  await db.run(sql`DROP TABLE IF EXISTS client_cookies`);
  await db.run(sql`DROP TABLE IF EXISTS credentials`);
  await db.run(sql`DROP TABLE IF EXISTS clients`);

  await db.run(sql`DROP TABLE IF EXISTS admin_sessions`);
  await db.run(sql`DROP TABLE IF EXISTS proxy_settings`);
  await db.run(sql`DROP TABLE IF EXISTS proxies`);
  await db.run(sql`DROP TABLE IF EXISTS domains`);
  await db.run(sql`DROP TABLE IF EXISTS telegram_notifications`);
  await db.run(sql`DROP TABLE IF EXISTS landing_pages`);
  await db.run(sql`DROP TABLE IF EXISTS default_services`);
  await db.run(sql`DROP TABLE IF EXISTS single_link_settings`);
  await db.run(sql`DROP TABLE IF EXISTS captcha_settings`);
  await db.run(sql`DROP TABLE IF EXISTS licenses`);

  await db.run(sql`DROP TABLE IF EXISTS settings`);

  await db.run(sql`DROP TABLE IF EXISTS tokens`);
  await db.run(sql`DROP TABLE IF EXISTS tracking_cookies`);
  await db.run(sql`DROP TABLE IF EXISTS ip_log`);

  await db.run(sql`DROP TABLE IF EXISTS legacy_migrations`);

  await db.run(sql`PRAGMA foreign_keys = ON`);

  console.log("Database reset complete");
}

reset();