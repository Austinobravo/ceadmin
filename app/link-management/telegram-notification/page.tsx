import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { telegramNotifications } from "@/lib/schema/main.schema";
import { TelegramForm } from "../SettingsForms";

export const dynamic = "force-dynamic";

export default async function TelegramNotificationPage() {
  const session = await requireSession();
  const [row] = await db
    .select()
    .from(telegramNotifications)
    .where(eq(telegramNotifications.licenseId, session.licenseId))
    .limit(1);

  return <SettingsPage title="Telegram Notification" form={<TelegramForm initial={{ chatId: row?.chatId ?? "", botToken: row?.botToken ?? "" }} />} />;
}

function SettingsPage({ title, form }: { title: string; form: React.ReactNode }) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Link Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
        </div>
        {form}
      </div>
    </div>
  );
}
