"use client";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button, cn } from "./ui";
import type { ActionState } from "@/actions/masters";
import { deleteEntry, type EntryKind } from "@/actions/entries";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/** Generic form: shows error, resets on success, keeps dialog UX optional. */
export function ActionForm({ action, children, submit = "Save", className, onDone, keep = [] }: { action: Action; children: ReactNode; submit?: string; className?: string; onDone?: () => void; keep?: string[] }) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state.ok) {
      const f = ref.current;
      if (f) {
        const kept: Record<string, string> = {};
        keep.forEach((n) => { const el = f.elements.namedItem(n) as HTMLInputElement | null; if (el) kept[n] = el.value; });
        f.reset();
        Object.entries(kept).forEach(([n, v]) => { const el = f.elements.namedItem(n) as HTMLInputElement | null; if (el) el.value = v; });
      }
      onDone?.();
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <form ref={ref} action={formAction} className={cn("space-y-3", className)}>
      {children}
      {state.error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{state.error}</p>}
      {state.ok && !state.error && <p className="text-sm text-success bg-success/10 rounded-lg px-3 py-2">Saved ✓</p>}
      <Button type="submit" disabled={pending} className="w-full md:w-auto">{pending ? "Saving…" : submit}</Button>
    </form>
  );
}

/** Mobile-friendly bottom sheet / desktop modal. */
export function Sheet({ title, trigger, children }: { title: string; trigger: ReactNode; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" role="dialog" aria-modal>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative w-full md:max-w-lg max-h-[92dvh] overflow-y-auto bg-card rounded-t-3xl md:rounded-2xl p-5 safe-b shadow-2xl">
            <div className="mx-auto h-1 w-10 rounded-full bg-input mb-3 md:hidden" />
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">{title}</h2><button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground">✕</button></div>
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}

export function ConfirmButton({ onConfirm, label = "Delete", confirm = "Delete this entry?", className }: { onConfirm: () => Promise<void>; label?: string; confirm?: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [arm, setArm] = useState(false);
  const router = useRouter();
  if (!arm) return <button onClick={() => setArm(true)} className={cn("text-xs text-muted-foreground hover:text-danger", className)}>{label}</button>;
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="text-foreground/80">{confirm}</span>
      <button disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); router.refresh(); } finally { setBusy(false); setArm(false); } }} className="text-danger font-medium">Yes</button>
      <button onClick={() => setArm(false)} className="text-muted-foreground">No</button>
    </span>
  );
}

export function RangeFilter({ from, to }: { from?: string; to?: string }) {
  const router = useRouter();
  const [f, setF] = useState(from ?? ""); const [t, setT] = useState(to ?? "");
  const apply = (nf: string, nt: string) => { const q = new URLSearchParams(); if (nf) q.set("from", nf); if (nt) q.set("to", nt); router.push("?" + q.toString()); };
  const inp = "h-10 rounded-xl border border-input bg-card px-2.5 text-sm";
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type="date" value={f} onChange={(e) => { setF(e.target.value); apply(e.target.value, t); }} className={inp} />
      <span className="text-muted-foreground text-xs">to</span>
      <input type="date" value={t} onChange={(e) => { setT(e.target.value); apply(f, e.target.value); }} className={inp} />
      {(f || t) && <button onClick={() => { setF(""); setT(""); router.push("?"); }} className="text-xs text-muted-foreground underline">All time</button>}
    </div>
  );
}

export function PwaRegister() {
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {}); }, []);
  return null;
}

/** Sheet variant usable from Server Components (plain children, no render-prop). */
export function AddSheet({ title, children }: { title: string; children: ReactNode }) {
  return <Sheet title={title} trigger={<Button className="bg-primary hover:bg-primary/90">+ {title}</Button>}>{() => children}</Sheet>;
}

export function DeleteEntryButton({ kind, id }: { kind: EntryKind; id: number }) {
  return <ConfirmButton onConfirm={() => deleteEntry(kind, id)} />;
}
