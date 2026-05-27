"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Menu,
  Network,
  Plus,
  Send,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  // { name: "Clients", href: "/clients", icon: Users },
  // { name: "Credentials", href: "/credentials", icon: KeyRound },
  {
    name: "Proxy Management",
    href: "/proxy-management",
    icon: Network,
    children: [
      { name: "Settings", href: "/proxy-management/settings", icon: SlidersHorizontal },
      { name: "Add Proxy", href: "/proxy-management/add-proxy", icon: Plus },
    ],
  },
  {
    name: "Domain Management",
    href: "/domain-management",
    icon: Globe2,
    children: [{ name: "Add Domain", href: "/domain-management/add-domain", icon: Plus }],
  },
  {
    name: "Link Management",
    href: "/link-management",
    icon: Send,
    children: [
      { name: "Telegram Notification", href: "/link-management/telegram-notification", icon: Send },
      { name: "Landing Page", href: "/link-management/landing-page", icon: Globe2 },
      { name: "Set Default Service", href: "/link-management/default-service", icon: Settings },
      { name: "Use as Single Link", href: "/link-management/single-link", icon: SlidersHorizontal },
      { name: "Use Captcha", href: "/link-management/captcha", icon: ShieldAlert },
    ],
  },
  // { name: "Settings", href: "/settings", icon: Settings },
  // { name: "Security", href: "/security", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const expandedGroups = useMemo(
    () =>
      navItems.reduce<Record<string, boolean>>((acc, item) => {
        if (item.children) acc[item.name] = pathname.startsWith(item.href);
        return acc;
      }, {}),
    [pathname],
  );

  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});

  const content = (
    <aside className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--panel)]/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 border-b border-[var(--border)] px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-[var(--text)]">CE Admin</p>
          <p className="text-xs text-[var(--muted)]">Control console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-xs font-semibold uppercase text-[var(--muted)]">Workspace</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const isGroupActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const isExpanded = manualExpanded[item.name] ?? expandedGroups[item.name] ?? false;

            if (hasChildren) {
              return (
                <li key={item.name}>
                  <button
                    type="button"
                    onClick={() =>
                      setManualExpanded((current) => ({
                        ...current,
                        [item.name]: !isExpanded,
                      }))
                    }
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isGroupActive
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                    }`}
                    aria-expanded={isExpanded}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 flex-1 text-left">{item.name}</span>
                    <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded ? (
                    <ul className="ml-5 mt-1 space-y-1 border-l border-[var(--border)] pl-3">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                childActive
                                  ? "bg-cyan-400 text-slate-950"
                                  : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                              }`}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            }

            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="font-semibold text-white">CE Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)]"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">{content}</div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative h-full w-80 max-w-[86vw]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
