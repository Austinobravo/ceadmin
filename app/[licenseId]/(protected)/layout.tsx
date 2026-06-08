import { notFound } from "next/navigation";
import { getLicenseForAuth, requireSession } from "@/lib/auth";
import { Sidebar } from "@/app/components/Sidebar";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { LogoutButton } from "@/app/components/LogoutButton";
import { TourGuide } from "@/app/components/TourGuide";
import { validateAdminLicense } from "@/lib/admin-license";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ licenseId: string }>;
}) {
  const { licenseId } = await params;
  const normalized = licenseId.trim();

  if (!/^admin[a-zA-Z0-9]{16,80}$/.test(normalized)) {
    notFound();
  }

  validateAdminLicense(normalized);

  const license = await getLicenseForAuth(normalized);
  if (!license) {
    notFound();
  }

  const session = await requireSession();
  if (session.licenseId !== normalized) {
    notFound();
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
