"use client";
import { useState } from "react";
import { saveSite, saveWorker, saveSupplier, saveMaterial, toggleActive } from "@/actions/masters";
import { ActionForm, Sheet } from "@/components/forms";
import { Card, Field, Input, Select, Button, Badge, Table, th, td, tdn, Empty, cn } from "@/components/ui";
import { inr } from "@/lib/format";
import { useRouter } from "next/navigation";

type M = { sites: { id: number; name: string; clientName: string; contractValue: number; active: boolean }[]; workers: { id: number; name: string; type: string; dailyRate: number; phone: string | null; active: boolean }[]; suppliers: { id: number; name: string; phone: string | null; active: boolean }[]; materials: { id: number; name: string; unit: string }[] };
const TABS = [["sites", "Sites"], ["workers", "Workers"], ["suppliers", "Suppliers"], ["materials", "Materials"]] as const;

export function SetupTabs({ masters, canWrite, tab: initial }: { masters: M; canWrite: boolean; tab: string }) {
  const [tab, setTab] = useState(initial);
  const router = useRouter();
  const toggle = async (kind: "site" | "worker" | "supplier", id: number, active: boolean) => { await toggleActive(kind, id, active); router.refresh(); };
  return (
    <>
      <div className="flex gap-1 rounded-xl bg-muted p-1 mb-4 overflow-x-auto">
        {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("flex-1 h-9 rounded-lg text-sm font-medium whitespace-nowrap px-3", tab === k ? "bg-card shadow-sm" : "text-muted-foreground")}>{l}</button>)}
      </div>
      {tab === "sites" && <Section title="Sites" count={masters.sites.length} canWrite={canWrite} form={(close, item) => (
        <ActionForm action={saveSite} onDone={close}>{item && <input type="hidden" name="id" value={item.id} />}
          <Field label="Site name"><Input name="name" defaultValue={item?.name} required /></Field>
          <Field label="Client name"><Input name="clientName" defaultValue={item?.clientName} required /></Field>
          <Field label="Contract value (₹)" hint="Leave 0 if not fixed"><Input type="number" name="contractValue" inputMode="decimal" defaultValue={item?.contractValue ?? 0} /></Field>
        </ActionForm>)} items={masters.sites}
        head={<><th className={th}>Site</th><th className={th}>Client</th><th className={th + " text-right"}>Contract</th><th className={th}>Status</th></>}
        row={(s) => <><td className={td + " font-medium"}>{s.name}</td><td className={td}>{s.clientName}</td><td className={tdn}>{inr(s.contractValue)}</td><td className={td}><Badge tone={s.active ? "green" : "gray"}>{s.active ? "Active" : "Closed"}</Badge></td></>}
        onToggle={(s) => toggle("site", s.id, !s.active)} />}
      {tab === "workers" && <Section title="Workers" count={masters.workers.length} canWrite={canWrite} form={(close, item) => (
        <ActionForm action={saveWorker} onDone={close}>{item && <input type="hidden" name="id" value={item.id} />}
          <Field label="Worker name"><Input name="name" defaultValue={item?.name} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><Select name="type" defaultValue={item?.type ?? "Labour"}><option>Mason</option><option>Labour</option></Select></Field>
            <Field label="Daily rate (₹)"><Input type="number" name="dailyRate" inputMode="decimal" defaultValue={item?.dailyRate} required /></Field>
          </div>
          <Field label="Phone"><Input name="phone" inputMode="tel" defaultValue={item?.phone ?? ""} /></Field>
        </ActionForm>)} items={masters.workers}
        head={<><th className={th}>Worker</th><th className={th}>Type</th><th className={th + " text-right"}>Rate / day</th><th className={th}>Phone</th><th className={th}>Status</th></>}
        row={(w) => <><td className={td + " font-medium"}>{w.name}</td><td className={td}><Badge tone={w.type === "Mason" ? "blue" : "gray"}>{w.type}</Badge></td><td className={tdn}>{inr(w.dailyRate)}</td><td className={td}>{w.phone}</td><td className={td}><Badge tone={w.active ? "green" : "gray"}>{w.active ? "Active" : "Left"}</Badge></td></>}
        onToggle={(w) => toggle("worker", w.id, !w.active)} />}
      {tab === "suppliers" && <Section title="Suppliers" count={masters.suppliers.length} canWrite={canWrite} form={(close, item) => (
        <ActionForm action={saveSupplier} onDone={close}>{item && <input type="hidden" name="id" value={item.id} />}
          <Field label="Supplier name"><Input name="name" defaultValue={item?.name} required /></Field>
          <Field label="Phone / note"><Input name="phone" defaultValue={item?.phone ?? ""} /></Field>
        </ActionForm>)} items={masters.suppliers}
        head={<><th className={th}>Supplier</th><th className={th}>Phone</th><th className={th}>Status</th></>}
        row={(s) => <><td className={td + " font-medium"}>{s.name}</td><td className={td}>{s.phone}</td><td className={td}><Badge tone={s.active ? "green" : "gray"}>{s.active ? "Active" : "Inactive"}</Badge></td></>}
        onToggle={(s) => toggle("supplier", s.id, !s.active)} />}
      {tab === "materials" && <Section title="Materials" count={masters.materials.length} canWrite={canWrite} form={(close, item) => (
        <ActionForm action={saveMaterial} onDone={close}>{item && <input type="hidden" name="id" value={item.id} />}
          <Field label="Material"><Input name="name" defaultValue={item?.name} required /></Field>
          <Field label="Unit"><Input name="unit" placeholder="Bag / Brass / Nos / Kg" defaultValue={item?.unit} required list="units" /><datalist id="units"><option>Bag</option><option>Brass</option><option>Nos</option><option>Kg</option><option>Ton</option><option>Box</option><option>Litre</option></datalist></Field>
        </ActionForm>)} items={masters.materials}
        head={<><th className={th}>Material</th><th className={th}>Unit</th></>}
        row={(m) => <><td className={td + " font-medium"}>{m.name}</td><td className={td}>{m.unit}</td></>} />}
    </>
  );
}

function Section<T extends { id: number; name: string; active?: boolean }>({ title, count, canWrite, form, items, head, row, onToggle }: {
  title: string; count: number; canWrite: boolean; form: (close: () => void, item?: T) => React.ReactNode; items: T[]; head: React.ReactNode; row: (i: T) => React.ReactNode; onToggle?: (i: T) => void;
}) {
  return (
    <Card className="px-4 md:px-0">
      <div className="flex items-center justify-between px-0 md:px-4 py-3">
        <div className="font-semibold">{title} <span className="text-muted-foreground font-normal text-sm">({count})</span></div>
        {canWrite && <Sheet title={`Add ${title.slice(0, -1).toLowerCase()}`} trigger={<Button className="bg-primary hover:bg-primary/90 h-9">+ Add</Button>}>{(close) => form(close)}</Sheet>}
      </div>
      {items.length === 0 ? <Empty text={`No ${title.toLowerCase()} yet.`} /> : (
        <Table>
          <thead><tr>{head}{canWrite && <th className={th} />}</tr></thead>
          <tbody>{items.map((i) => (
            <tr key={i.id} className={i.active === false ? "opacity-60" : ""}>
              {row(i)}
              {canWrite && <td className={td + " text-right whitespace-nowrap"}>
                <Sheet title={`Edit ${i.name}`} trigger={<button className="text-xs text-primary mr-3">Edit</button>}>{(close) => form(close, i)}</Sheet>
                {onToggle && <button onClick={() => onToggle(i)} className="text-xs text-muted-foreground">{i.active === false ? "Reactivate" : "Deactivate"}</button>}
              </td>}
            </tr>))}</tbody>
        </Table>)}
    </Card>
  );
}
