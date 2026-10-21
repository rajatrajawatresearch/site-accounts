import { listSupplierPayments, getMasters } from "@/lib/queries";
import { EntryPage } from "@/components/entry-page";
import { Field, Input } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { Pick } from "@/components/pickers";
import { addSupplierPayment } from "@/actions/entries";
import { fmtDate, inr, monthStart, todayISO } from "@/lib/format";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const range = { from: sp.from === "" ? undefined : sp.from ?? monthStart(), to: sp.to };
  const [rows, m] = await Promise.all([listSupplierPayments(range), getMasters()]);
  return (
    <EntryPage title="Supplier Payments" sub="Money paid to suppliers" kind="supplierPayments" rows={rows} range={range} totalKey="amount" addLabel="Add payment"
      form={
        <ActionForm action={addSupplierPayment} keep={["date"]}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" name="date" defaultValue={todayISO()} required /></Field>
            <Field label="Amount (₹)"><Input type="number" name="amount" inputMode="decimal" min={1} required /></Field>
          </div>
          <Field label="Supplier"><Pick name="supplierId" options={m.suppliers} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Paid by"><Input name="paidBy" placeholder="Cash / UPI / Bank" /></Field>
            <Field label="Against bill no."><Input name="billNo" /></Field>
          </div>
          <Field label="Note"><Input name="note" /></Field>
        </ActionForm>}
      cols={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
        { key: "supplier", label: "Supplier" },
        { key: "amount", label: "Amount", num: true, render: (r) => inr(r.amount) },
        { key: "paidBy", label: "Paid by" }, { key: "billNo", label: "Bill" }, { key: "note", label: "Note" },
      ]} />
  );
}
