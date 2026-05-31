import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-12 text-[var(--text)]">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl items-center justify-center">
        <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] p-8 text-center shadow-2xl shadow-black/10 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <SearchX className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase text-cyan-400">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
            This route is not part of the CE Admin console. Use your assigned license URL or return to the homepage.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}
