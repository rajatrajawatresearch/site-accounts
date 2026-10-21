import { listClientPayments, getMasters } from "@/lib/queries";
import { EntryPage } from "@/components/entry-page";
import { Field, Input } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { Pick } from "@/components/pickers";
import { addClientPayment } from "@/actions/entries";
import { fmtDate, inr, monthStart, todayISO } from "@/lib/format";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const range = { from: sp.from === "" ? undefined : sp.from ?? monthStart(), to: sp.to };
  const [rows, m] = await Promise.all([listClientPayments(range), getMasters()]);
  return (
    <EntryPage title="Client Payments" sub="Money received from clients per site" kind="clientPayments" rows={rows} range={range} totalKey="amount" addLabel="Add receipt"
      form={
        <ActionForm action={addClientPayment} keep={["date"]}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" name="date" defaultValue={todayISO()} required /></Field>
            <Field label="Amount (₹)"><Input type="number" name="amount" inputMode="decimal" min={1} required /></Field>
          </div>
          <Field label="Site"><Pick name="siteId" options={m.sites} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Received by"><Input name="receivedBy" placeholder="Cash / Bank" /></Field>
            <Field label="Note"><Input name="note" placeholder="1st installment" /></Field>
          </div>
        </ActionForm>}
      cols={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
        { key: "site", label: "Site" }, { key: "client", label: "Client" },
        { key: "amount", label: "Amount", num: true, render: (r) => inr(r.amount) },
        { key: "receivedBy", label: "Received by" }, { key: "note", label: "Note" },
      ]} />
  );
}
