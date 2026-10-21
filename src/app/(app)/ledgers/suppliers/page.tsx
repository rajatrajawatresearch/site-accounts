import { supplierLedger } from "@/lib/queries";
import { inr, inrSigned } from "@/lib/format";
import { PageHeader, Card, Table, th, td, tdn, Badge, Empty } from "@/components/ui";

export default async function Page() {
  const rows = await supplierLedger();
  const t = rows.reduce((a, x) => ({ bills: a.bills + x.bills, paid: a.paid + x.paid, out: a.out + x.outstanding }), { bills: 0, paid: 0, out: 0 });
  return (
    <>
      <PageHeader title="Supplier Ledger" sub="Total bills − total paid = outstanding" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[["Total bills", inr(t.bills)], ["Total paid", inr(t.paid)], ["Outstanding", inrSigned(t.out)]].map(([l, v]) => <Card key={l} className="p-3"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold num">{v}</div></Card>)}
      </div>
      <Card className="px-4 md:px-0">
        {rows.length === 0 ? <Empty text="No suppliers. Add in Setup." /> : (
          <Table>
            <thead><tr><th className={th}>Supplier</th><th className={th + " text-right"}>Bills</th><th className={th + " text-right"}>Paid</th><th className={th + " text-right"}>Outstanding</th><th className={th}>Status</th></tr></thead>
            <tbody>{rows.map((s) => (
              <tr key={s.id} className={!s.active ? "opacity-50" : ""}>
                <td className={td + " font-medium"}>{s.name}{s.phone && <div className="text-xs text-muted-foreground">{s.phone}</div>}</td>
                <td className={tdn}>{inr(s.bills)}</td><td className={tdn}>{inr(s.paid)}</td>
                <td className={tdn + " font-semibold " + (s.outstanding > 0 ? "text-danger" : s.outstanding < 0 ? "text-warning" : "")}>{inrSigned(s.outstanding)}</td>
                <td className={td}>{s.bills === 0 && s.paid === 0 ? <span className="text-muted-foreground/60">—</span> : s.outstanding > 0 ? <Badge tone="red">Payment Due</Badge> : s.outstanding < 0 ? <Badge tone="amber">Advance Paid</Badge> : <Badge tone="green">Clear</Badge>}</td>
              </tr>))}</tbody>
          </Table>)}
      </Card>
    </>
  );
}
