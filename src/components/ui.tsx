import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cn(...c: (string | false | null | undefined)[]) { return c.filter(Boolean).join(" "); }

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl bg-card border border-border shadow-[0_1px_2px_rgba(15,23,42,.04)]", className)}>{children}</div>;
}
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5">
      <div><h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>{sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}</div>
      {action}
    </div>
  );
}
export function Button({ className, variant = "primary", ...p }: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" | "outline" }) {
  const v = { primary: "bg-primary text-primary-foreground hover:bg-primary/90", ghost: "text-foreground/80 hover:bg-muted", danger: "text-danger hover:bg-danger/10", outline: "border border-input text-foreground hover:bg-muted bg-card" }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 h-11 md:h-10 px-4 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed", v, className)} />;
}
export function LinkButton({ className, href, children }: { className?: string; href: string; children: ReactNode }) {
  return <Link href={href} className={cn("inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition", className)}>{children}</Link>;
}
export function Field({ label, children, hint, className }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return <label className={cn("block", className)}><span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>{children}{hint && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}</label>;
}
const base = "w-full h-11 md:h-10 rounded-xl border border-input bg-card px-3 text-[15px] md:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60";
export function Input(p: ComponentProps<"input">) { return <input {...p} className={cn(base, p.className)} />; }
export function Select(p: ComponentProps<"select">) { return <select {...p} className={cn(base, "appearance-none", p.className)} />; }
export function Badge({ tone = "gray", children }: { tone?: "gray" | "green" | "red" | "amber" | "blue"; children: ReactNode }) {
  const t = { gray: "bg-muted text-foreground/80", green: "bg-success/10 text-success", red: "bg-danger/10 text-danger", amber: "bg-warning/10 text-warning", blue: "bg-info/10 text-info" }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", t)}>{children}</span>;
}
export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "neutral" }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold tracking-tight num", tone === "good" && "text-success", tone === "bad" && "text-danger")}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}
export function Empty({ text }: { text: string }) { return <div className="py-12 text-center text-sm text-muted-foreground">{text}</div>; }
export function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto -mx-4 md:mx-0"><table className="w-full text-sm min-w-[640px] md:min-w-0">{children}</table></div>;
}
export const th = "text-left text-xs font-medium text-muted-foreground px-4 py-2.5 border-b border-border whitespace-nowrap";
export const td = "px-4 py-2.5 border-b border-border whitespace-nowrap";
export const tdn = td + " text-right num";
