import { notFound, redirect } from "next/navigation";
import { ensureLicense, getSession } from "@/lib/auth";
import { AuthForm } from "./AuthForm";
import { validateAdminLicense } from "@/lib/admin-license";

export const dynamic = "force-dynamic";

export default async function LicenseAuthPage(props: PageProps<"/[licenseId]">) {
  const { licenseId } = await props.params;
  const normalized = licenseId.trim();

  if (!/^admin[a-zA-Z0-9]{16,80}$/.test(normalized)) {
    notFound();
  }

  validateAdminLicense(normalized);

  const session = await getSession();
  if (session?.licenseId === normalized) {
    redirect(`/${normalized}/overview`);
  }

  const license = await ensureLicense(normalized);

  return (
    <div className="grid min-h-screen bg-[#080b10] text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex min-h-[42vh] items-end overflow-hidden border-b border-white/10 px-6 py-10 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.28),transparent_38%),radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.18),transparent_32%),linear-gradient(180deg,#101826,#080b10)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#080b10] to-transparent" />
        <div className="relative max-w-2xl pb-2">
          <p className="text-sm font-medium text-cyan-300">License console</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">CE Admin</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Secure dashboard access scoped to a dynamic license path on the current domain.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <AuthForm licenseId={normalized} mode={license.passwordHash ? "login" : "setup"} />
      </section>
    </div>
  );
}
