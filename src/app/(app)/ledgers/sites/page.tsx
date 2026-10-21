import { siteSummary } from "@/lib/queries";
import { inr, inrSigned } from "@/lib/format";
import { PageHeader, Card, Table, th, td, tdn, Badge, Empty } from "@/components/ui";

export default async function Page() {
  const rows = await siteSummary();
  const t = rows.reduce((a, x) => ({ c: a.c + x.contract, r: a.r + x.received, m: a.m + x.material, l: a.l + x.labour, p: a.p + x.profit }), { c: 0, r: 0, m: 0, l: 0, p: 0 });
  return (
    <>
      <PageHeader title="Site Summary" sub="Received from client − (material + labour) = profit / loss" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[["Contract value", inr(t.c)], ["Received", inr(t.r)], ["Material cost", inr(t.m)], ["Labour cost", inr(t.l)], ["Profit / Loss", inrSigned(t.p)]].map(([l, v], i) => <Card key={l} className="p-3"><div className="text-xs text-muted-foreground">{l}</div><div className={"text-lg font-semibold num " + (i === 4 ? (t.p >= 0 ? "text-success" : "text-danger") : "")}>{v}</div></Card>)}
      </div>
      <div className="grid md:hidden gap-3 mb-4">
        {rows.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex justify-between items-start"><div><div className="font-semibold">{s.name}</div><div className="text-xs text-muted-foreground">{s.client}</div></div><div className={"text-lg font-semibold num " + (s.profit >= 0 ? "text-success" : "text-danger")}>{inrSigned(s.profit)}</div></div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-muted-foreground">Contract</div><div className="text-right num">{inr(s.contract)}</div>
              <div className="text-muted-foreground">Received</div><div className="text-right num">{inr(s.received)}</div>
              <div className="text-muted-foreground">Balance from client</div><div className="text-right num text-warning">{inr(s.balanceFromClient)}</div>
              <div className="text-muted-foreground">Material</div><div className="text-right num">{inr(s.material)}</div>
              <div className="text-muted-foreground">Labour</div><div className="text-right num">{inr(s.labour)}</div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${s.contract > 0 ? Math.min(100, (s.received / s.contract) * 100) : 0}%` }} /></div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.contract > 0 ? Math.round((s.received / s.contract) * 100) : 0}% of contract received</div>
          </Card>
        ))}
      </div>
      <Card className="hidden md:block">
        {rows.length === 0 ? <Empty text="No sites. Add in Setup." /> : (
          <Table>
            <thead><tr><th className={th}>Site</th><th className={th}>Client</th><th className={th + " text-right"}>Contract</th><th className={th + " text-right"}>Received</th><th className={th + " text-right"}>Balance</th><th className={th + " text-right"}>Material</th><th className={th + " text-right"}>Labour</th><th className={th + " text-right"}>Total cost</th><th className={th + " text-right"}>Profit / Loss</th></tr></thead>
            <tbody>{rows.map((s) => (
              <tr key={s.id} className={!s.active ? "opacity-50" : ""}>
                <td className={td + " font-medium"}>{s.name} {!s.active && <Badge>Closed</Badge>}</td><td className={td}>{s.client}</td>
                <td className={tdn}>{inr(s.contract)}</td><td className={tdn}>{inr(s.received)}</td><td className={tdn + " text-warning"}>{inr(s.balanceFromClient)}</td>
                <td className={tdn}>{inr(s.material)}</td><td className={tdn}>{inr(s.labour)}</td><td className={tdn}>{inr(s.totalCost)}</td>
                <td className={tdn + " font-semibold " + (s.profit >= 0 ? "text-success" : "text-danger")}>{inrSigned(s.profit)}</td>
              </tr>))}</tbody>
          </Table>)}
      </Card>
    </>
  );
}
