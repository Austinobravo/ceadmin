import { ipLog, tokens } from "@/lib/schema";
import { securityDb } from "@/lib/db";
import { ShieldAlert, Activity, Cookie } from "lucide-react";
import { desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  await requireSession();
  // const ipLogs = securityDb.db.prepare(`SELECT * FROM ip_log ORDER BY timestamp DESC LIMIT 50`).all();
  // const tokens = securityDb.db.prepare(`SELECT * FROM tokens ORDER BY created_at DESC`).all();
  const ipLogs = await securityDb
    .select()
    .from(ipLog)
    .orderBy(desc(ipLog.timestamp))
    .limit(50);

  const tokenDetails = await securityDb
    .select()
    .from(tokens)
    .orderBy(desc(tokens.created_at));
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-emerald-500" />
              Security Logs
            </h1>
            <p className="text-gray-400 mt-2">Monitor API tokens and recent IP request activity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-[#222]">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Recent IP Activity
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-[#222]">
                <thead className="bg-[#161616] sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {ipLogs.map((log: any) => (
                    <tr key={`${log.ip}-${log.timestamp}`} className="hover:bg-[#161616] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">{log.ip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {ipLogs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500 text-sm">No recent IP logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
             <div className="px-6 py-5 border-b border-[#222]">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Cookie className="w-5 h-5 text-gray-400" />
                Active API Tokens
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-[#222]">
                <thead className="bg-[#161616] sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {tokenDetails.map((t: any) => (
                    <tr key={t.token} className="hover:bg-[#161616] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                        {t.token.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(t.created_at * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {tokenDetails.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-gray-500 text-sm">No active API tokens found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
