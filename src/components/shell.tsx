import Link from "next/link";
import type { Session } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { ROLE_LABEL } from "@/lib/rbac";
import { logoutAction } from "@/actions/auth";
import { NavLink } from "./navlink";
import { PwaRegister } from "./forms";
import { ThemeControls } from "./theme";

const NAV = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/attendance", label: "Attendance", icon: "☑" },
  { href: "/advances", label: "Advances", icon: "₹" },
  { href: "/material", label: "Material Bills", icon: "▤" },
  { href: "/supplier-payments", label: "Supplier Payments", icon: "⇡" },
  { href: "/client-payments", label: "Client Payments", icon: "⇣" },
  { href: "/ledgers/workers", label: "Worker Ledger", icon: "☰" },
  { href: "/ledgers/suppliers", label: "Supplier Ledger", icon: "☰" },
  { href: "/ledgers/sites", label: "Site Summary", icon: "◩" },
  { href: "/setup", label: "Setup (Masters)", icon: "⚙" },
];
const MOBILE = [
  { href: "/", label: "Home", icon: "▦" },
  { href: "/attendance", label: "Attendance", icon: "☑" },
  { href: "/advances", label: "Advances", icon: "₹" },
  { href: "/ledgers/sites", label: "Sites", icon: "◩" },
  { href: "/more", label: "More", icon: "⋯" },
];

export function Shell({ session, children }: { session: Session; children: React.ReactNode }) {
  const admin = can(session.role, "users.manage");
  return (
    <div className="min-h-dvh md:flex overflow-x-clip">
      <PwaRegister />
      <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground sticky top-0 h-dvh border-r border-border">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-foreground/10">
          <div className="h-9 w-9 rounded-xl bg-sidebar-foreground text-primary grid place-items-center font-bold">S</div>
          <div><div className="font-semibold leading-tight">Site Accounts</div><div className="text-[11px] text-sidebar-foreground/50">Construction accounts</div></div>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map((n) => <NavLink key={n.href} href={n.href} icon={n.icon} label={n.label} />)}
          {admin && <><div className="px-3 pt-4 pb-1 text-[11px] uppercase tracking-wider text-sidebar-foreground/40">Admin</div><NavLink href="/admin/users" icon="👥" label="Users & Roles" /></>}
        </nav>
        <div className="p-3 border-t border-sidebar-foreground/10 space-y-2">
          <div className="px-1"><ThemeControls /></div>
          <Link href="/account" className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-sidebar-foreground/5">
            <div className="h-8 w-8 rounded-full bg-sidebar-foreground/10 grid place-items-center text-sm font-semibold">{session.name[0]?.toUpperCase()}</div>
            <div className="min-w-0"><div className="text-sm font-medium truncate">{session.name}</div><div className="text-[11px] text-sidebar-foreground/50">{ROLE_LABEL[session.role]}</div></div>
          </Link>
          <form action={logoutAction}><button className="w-full text-left text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground px-3 py-1.5">Sign out</button></form>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between border-b border-border" style={{ paddingTop: "max(.75rem, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-sidebar-foreground text-primary grid place-items-center text-sm font-bold">S</div><span className="font-semibold">Site Accounts</span></div>
          <Link href="/account" className="h-8 w-8 rounded-full bg-sidebar-foreground/10 grid place-items-center text-sm font-semibold">{session.name[0]?.toUpperCase()}</Link>
        </header>
        <main className="flex-1 min-w-0 px-4 md:px-8 py-5 md:py-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto overflow-x-clip">{children}</main>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border safe-b">
          <div className="grid grid-cols-5">
            {MOBILE.map((n) => <NavLink key={n.href} href={n.href} icon={n.icon} label={n.label} mobile />)}
          </div>
        </nav>
      </div>
    </div>
  );
}
