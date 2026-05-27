"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";
import { TourGuide } from "./TourGuide";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthScreen = pathname === "/" || /^\/admin[a-zA-Z0-9]{16,80}$/.test(pathname);

  if (isAuthScreen) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text)] lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-72">
        <div className="sticky top-0 z-20 hidden h-16 items-center justify-end gap-2 border-b border-[var(--border)] bg-[var(--bg)]/85 px-8 backdrop-blur lg:flex">
          <ThemeToggle />
          <LogoutButton />
        </div>
        <main>{children}</main>
      </div>
      <TourGuide />
    </div>
  );
}
