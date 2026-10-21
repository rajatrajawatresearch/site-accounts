import { workerLedger } from "@/lib/queries";
import { inr, inrSigned } from "@/lib/format";
import { PageHeader, Card, Table, th, td, tdn, Badge, Empty } from "@/components/ui";
import { RangeFilter } from "@/components/forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const r = await searchParams;
  const rows = await workerLedger(r);
  const t = rows.reduce((a, x) => ({ days: a.days + x.days, wages: a.wages + x.wages, adv: a.adv + x.advances, bal: a.bal + x.balance }), { days: 0, wages: 0, adv: 0, bal: 0 });
  return (
    <>
      <PageHeader title="Worker Ledger" sub="Wages (days × rate) − advances = balance due. Set dates for weekly / monthly settlement." />
      <div className="mb-4"><RangeFilter from={r.from} to={r.to} /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[["Total days", String(t.days)], ["Total wages", inr(t.wages)], ["Advances", inr(t.adv)], ["Balance to pay", inrSigned(t.bal)]].map(([l, v]) => <Card key={l} className="p-3"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold num">{v}</div></Card>)}
      </div>
      <Card className="px-4 md:px-0">
        {rows.length === 0 ? <Empty text="No workers. Add in Setup." /> : (
          <Table>
            <thead><tr><th className={th}>Worker</th><th className={th}>Type</th><th className={th + " text-right"}>Rate</th><th className={th + " text-right"}>Days</th><th className={th + " text-right"}>Wages</th><th className={th + " text-right"}>Advances</th><th className={th + " text-right"}>Balance</th><th className={th}>Status</th></tr></thead>
            <tbody>{rows.map((w) => (
              <tr key={w.id} className={!w.active ? "opacity-50" : ""}>
                <td className={td + " font-medium"}>{w.name}</td><td className={td}><Badge tone={w.type === "Mason" ? "blue" : "gray"}>{w.type}</Badge></td>
                <td className={tdn}>{inr(w.rate)}</td><td className={tdn}>{w.days}</td><td className={tdn}>{inr(w.wages)}</td><td className={tdn}>{inr(w.advances)}</td>
                <td className={tdn + " font-semibold " + (w.balance > 0 ? "text-danger" : w.balance < 0 ? "text-warning" : "")}>{inrSigned(w.balance)}</td>
                <td className={td}>{w.wages === 0 && w.advances === 0 ? <span className="text-muted-foreground/60">—</span> : w.balance > 0 ? <Badge tone="red">To Pay</Badge> : w.balance < 0 ? <Badge tone="amber">Over-advanced</Badge> : <Badge tone="green">Settled</Badge>}</td>
              </tr>))}</tbody>
          </Table>)}
      </Card>
    </>
  );
}
