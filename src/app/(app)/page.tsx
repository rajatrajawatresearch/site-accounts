import Link from "next/link";
import { dashboard } from "@/lib/queries";
import { inr, inrSigned, todayISO, fmtDate } from "@/lib/format";
import { Card, PageHeader, Stat, Badge, Table, th, td, tdn, Empty } from "@/components/ui";

export default async function Dashboard() {
  const today = todayISO();
  const d = await dashboard(today);
  return (
    <>
      <PageHeader title="Dashboard" sub={`Today · ${fmtDate(today)}`} />
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Today at a glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Masons present" value={String(d.today.masons)} />
          <Stat label="Labour present" value={String(d.today.labour)} />
          <Stat label="Wages today" value={inr(d.today.wages)} />
          <Stat label="Advances today" value={inr(d.today.advances)} />
          <Stat label="Material today" value={inr(d.today.material)} />
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[["/attendance", "+ Attendance"], ["/advances", "+ Advance"], ["/material", "+ Material bill"], ["/client-payments", "+ Client payment"]].map(([h, l]) => (
            <Link key={h} href={h} className="h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium grid place-items-center hover:bg-primary/90">{l}</Link>
          ))}
        </div>
      </section>
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Overall position</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Owed to workers" value={inr(d.workersDue)} tone={d.workersDue > 0 ? "bad" : "neutral"} />
          <Stat label="Owed to suppliers" value={inr(d.suppliersDue)} tone={d.suppliersDue > 0 ? "bad" : "neutral"} />
          <Stat label="Pending from clients" value={inr(d.clientPending)} />
          <Stat label="Profit / Loss" value={inrSigned(d.profit)} tone={d.profit >= 0 ? "good" : "bad"} sub={`Received ${inr(d.received)} · Cost ${inr(d.cost)}`} />
        </div>
      </section>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Sites</h3><Link href="/ledgers/sites" className="text-xs text-primary">View all</Link></div>
          {d.sites.length === 0 ? <Empty text="No sites yet. Add in Setup." /> : (
            <Table><thead><tr><th className={th}>Site</th><th className={th + " text-right"}>Received</th><th className={th + " text-right"}>Cost</th><th className={th + " text-right"}>P/L</th></tr></thead>
              <tbody>{d.sites.map((s) => <tr key={s.id}><td className={td}>{s.name}<div className="text-xs text-muted-foreground">{s.client}</div></td><td className={tdn}>{inr(s.received)}</td><td className={tdn}>{inr(s.totalCost)}</td><td className={tdn + (s.profit >= 0 ? " text-success" : " text-danger")}>{inrSigned(s.profit)}</td></tr>)}</tbody></Table>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Workers to pay</h3><Link href="/ledgers/workers" className="text-xs text-primary">Ledger</Link></div>
            {d.topWorkers.length === 0 ? <Empty text="All settled." /> : d.topWorkers.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm"><div>{w.name} <Badge tone={w.type === "Mason" ? "blue" : "gray"}>{w.type}</Badge></div><div className={"num font-medium " + (w.balance > 0 ? "text-danger" : "text-success")}>{inrSigned(w.balance)}</div></div>
            ))}
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Suppliers outstanding</h3><Link href="/ledgers/suppliers" className="text-xs text-primary">Ledger</Link></div>
            {d.topSuppliers.length === 0 ? <Empty text="Nothing outstanding." /> : d.topSuppliers.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm"><div>{s.name}</div><div className={"num font-medium " + (s.outstanding > 0 ? "text-danger" : "text-success")}>{inrSigned(s.outstanding)}</div></div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
