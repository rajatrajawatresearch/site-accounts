"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./ui";

export function NavLink({ href, icon, label, mobile }: { href: string; icon: string; label: string; mobile?: boolean }) {
  const p = usePathname();
  const active = href === "/" ? p === "/" : p.startsWith(href);
  if (mobile) {
    return (
      <Link href={href} className={cn("flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]", active ? "text-primary font-semibold" : "text-muted-foreground")}>
        <span className="text-lg leading-none">{icon}</span>{label}
      </Link>
    );
  }
  return (
    <Link href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", active ? "bg-sidebar-foreground/10 text-sidebar-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground")}>
      <span className="w-5 text-center text-base opacity-80">{icon}</span>{label}
    </Link>
  );
}
