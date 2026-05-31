import Link from "next/link";
import { Captions, Globe2, Link2, Send, Settings } from "lucide-react";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const items = [
  ["Telegram Notification", "/link-management/telegram-notification", Send],
  ["Landing Page", "/link-management/landing-page", Globe2],
  ["Set Default Service", "/link-management/default-service", Settings],
  ["Use as Single Link", "/link-management/single-link", Link2],
  ["Use Captcha", "/link-management/captcha", Captions],
] as const;

export default async function LinkManagementPage() {
  await requireSession();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Link Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Delivery settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Configure notifications, service routing, default behavior, single-link mode, and captcha usage.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 transition hover:border-cyan-300/40"
            >
              <Icon className="h-7 w-7 text-cyan-400" />
              <h2 className="mt-5 text-lg font-semibold text-[var(--text)]">{label}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
