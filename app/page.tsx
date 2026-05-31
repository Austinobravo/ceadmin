import { ArrowRight, Compass, KeyRound, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getLastLicenseId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lastLicense = await getLastLicenseId();
  if (lastLicense) redirect(`/${lastLicense}`);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b10] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#0f172a,#080b10)]" />
      <section className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-12 sm:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
              Secure license access
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Open CE Admin from your assigned license route.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This console is protected by a unique admin license URL. Ask your super admin for the route they assigned to you, then open it on this same domain.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <Compass className="h-4 w-4 text-cyan-300" />
                Example: /admin5b2f1e77d29a4240bcd3d385296afe13
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">No license route found</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              We checked this browser for a previously used license and did not find one. Paste the exact route your super admin gave you into the address bar.
            </p>
            <div className="mt-6 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
              Once you sign in successfully, we will remember your license route and bring you back there from this homepage next time.
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-300">
              Waiting for assigned route
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
