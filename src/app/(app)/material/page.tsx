import { listMaterialBills, getMasters } from "@/lib/queries";
import { EntryPage } from "@/components/entry-page";
import { Field, Input } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { Pick } from "@/components/pickers";
import { addMaterialBill } from "@/actions/entries";
import { fmtDate, inr, monthStart, todayISO } from "@/lib/format";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const range = { from: sp.from === "" ? undefined : sp.from ?? monthStart(), to: sp.to };
  const [rows, m] = await Promise.all([listMaterialBills(range), getMasters()]);
  return (
    <EntryPage title="Material Bills" sub="Purchase bills: qty × rate + extra (transport / GST)" kind="material" rows={rows} range={range} totalKey="total" addLabel="Add bill"
      form={
        <ActionForm action={addMaterialBill} keep={["date", "siteId", "supplierId"]}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" name="date" defaultValue={todayISO()} required /></Field>
            <Field label="Bill no."><Input name="billNo" placeholder="B-101" /></Field>
          </div>
          <Field label="Site"><Pick name="siteId" options={m.sites} required /></Field>
          <Field label="Supplier"><Pick name="supplierId" options={m.suppliers} required /></Field>
          <Field label="Material"><Pick name="materialId" options={m.materials} required /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Qty"><Input type="number" name="quantity" step="any" inputMode="decimal" required /></Field>
            <Field label="Rate (₹)"><Input type="number" name="rate" step="any" inputMode="decimal" required /></Field>
            <Field label="Extra (₹)"><Input type="number" name="extra" step="any" inputMode="decimal" defaultValue={0} /></Field>
          </div>
          <Field label="Note"><Input name="note" /></Field>
        </ActionForm>}
      cols={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
        { key: "billNo", label: "Bill" }, { key: "site", label: "Site" }, { key: "supplier", label: "Supplier" },
        { key: "material", label: "Material", render: (r) => `${r.material} (${r.unit})` },
        { key: "quantity", label: "Qty", num: true }, { key: "rate", label: "Rate", num: true, render: (r) => inr(r.rate) },
        { key: "extra", label: "Extra", num: true, render: (r) => inr(r.extra) },
        { key: "total", label: "Total", num: true, render: (r) => <b>{inr(r.total)}</b> },
      ]} />
  );
}
