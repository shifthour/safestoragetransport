"use client";

import { SessionUser } from "@/lib/auth";

export type NavKey = "schedule" | "vendors" | "history" | "admin";

// Left rail (CRM-style): logo top, icon nav, signed-in user + logout pinned to the bottom.
const NAV: { key: NavKey; label: string; href: string; icon: string }[] = [
  { key: "schedule", label: "Schedule", href: "/?view=schedule", icon: "M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
  { key: "vendors", label: "Vendor panel", href: "/?view=vendors", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { key: "history", label: "Old schedules", href: "/?view=dashboard", icon: "M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8m9-1v5l4 2" },
  { key: "admin", label: "Command center", href: "/?src=admin", icon: "M3 13h8V3H3zm10 8h8V3h-8zM3 21h8v-6H3z" },
];

export default function Sidebar({ active, user }: { active: NavKey; user: SessionUser | null }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  const initials = (user?.name || "?").trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      {/* logo */}
      <div className="px-5 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/safestorage-logo.svg" alt="SafeStorage" className="h-9 w-auto" />
        <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">Smart Transport · Ops</div>
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((n) => {
          const on = active === n.key;
          return (
            <a
              key={n.key}
              href={n.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                on ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
                <path d={n.icon} />
              </svg>
              {n.label}
            </a>
          );
        })}
      </nav>

      {/* signed-in user + logout */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">{user?.name || "Signed in"}</div>
            <div className="truncate text-xs text-slate-400">{user?.email || ""}</div>
          </div>
          <button onClick={logout} title="Log out" aria-label="Log out" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
