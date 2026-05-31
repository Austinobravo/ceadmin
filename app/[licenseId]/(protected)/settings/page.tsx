import { settings } from "@/lib/schema";
import { configDb } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";
import { Settings } from "lucide-react";
import { inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireSession();
  const keys = ['BOT_TOKEN', 'CHAT_ID', 'H_KEY', 'R_KEY', 'LANDING_URL'];
  // const settings: Record<string, string> = {};
  
  // for (const key of keys) {
  //   settings[key] = configDb.getSetting(key) || "";
  // }
  const rows = await configDb
    .select()
    .from(settings)
    .where(inArray(settings.key, keys));

  const settingsDetails = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-gray-400" />
              System Configuration
            </h1>
            <p className="text-gray-400 mt-2">Manage backend integrations and global settings.</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222] rounded-2xl p-8 shadow-sm">
          <SettingsForm initialData={settingsDetails} />
        </div>
      </div>
    </div>
  );
}
