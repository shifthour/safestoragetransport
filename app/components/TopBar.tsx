"use client";

import { SessionUser } from "@/lib/auth";

// Top bar mirroring the CRM: search on the left, availability + notifications + avatar on the right.
export default function TopBar({ user }: { user: SessionUser | null }) {
  const initials = (user?.name || "?").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 backdrop-blur md:px-8">
      <div className="relative w-full max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
        <input
          type="search"
          placeholder="Search schedules, vendors, city…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-900/5"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-sm font-medium text-emerald-600 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
        </span>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200 hover:bg-white" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white" title={user?.name || ""}>{initials}</div>
      </div>
    </header>
  );
}
