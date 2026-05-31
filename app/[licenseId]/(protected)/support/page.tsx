import { LifeBuoy, Mail, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const channels = [
  // {
  //   label: "Phone",
  //   value: "+1 (202) 555-0184",
  //   detail: "Urgent account and license support",
  //   icon: Phone,
  //   href: "tel:+12025550184",
  // },
  // {
  //   label: "Email",
  //   value: "support@ceadmin.local",
  //   detail: "Configuration, billing, and product help",
  //   icon: Mail,
  //   href: "mailto:support@ceadmin.local",
  // },
  {
    label: "Telegram Channel",
    value: "Channel Handle",
    detail: "Fast chat for notification and link setup",
    icon: Send,
    // href: "https://t.me/ceadmin_support",
    href: "https://t.me/+tnnbO0eJM0BiMTFh",
  },
  {
    label: "Telegram Live Support Chat",
    value: "@Crusensup",
    detail: "Use your assigned admin channel",
    icon: MessageCircle,
    href: "#",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <p className="mt-6 text-sm font-medium text-cyan-400">Support</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Need help with your dashboard?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Contact support for license access, link management, proxy setup, domain routing, notification delivery, and captured data questions.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
              target="_blank"
                key={channel.label}
                href={channel.href}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-cyan-300/40 hover:bg-[var(--surface)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-400/12 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--muted)]">{channel.label}</p>
                    <p className="mt-1 break-words text-lg font-semibold text-[var(--text)]">{channel.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{channel.detail}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
            <p className="text-sm leading-6 text-[var(--muted)]">
              Never share your dashboard password in chat. Support can help reset access through the super admin workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
