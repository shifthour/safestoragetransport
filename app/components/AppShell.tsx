"use client";

import Sidebar, { NavKey } from "./Sidebar";
import TopBar from "./TopBar";
import { SessionUser } from "@/lib/auth";

// The one app frame every signed-in view renders inside: fixed left rail + top bar + content.
// Mirrors the Agentic CRM shell (logo top-left, search/status/avatar top-right, logout bottom-left).
export default function AppShell({
  active, user, children,
}: { active: NavKey; user: SessionUser | null; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar active={active} user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} />
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
