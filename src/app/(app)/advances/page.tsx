import { listAdvances, getMasters } from "@/lib/queries";
import { EntryPage } from "@/components/entry-page";
import { Badge, Field, Input } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { Pick } from "@/components/pickers";
import { addAdvance } from "@/actions/entries";
import { fmtDate, inr, monthStart, todayISO } from "@/lib/format";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const range = { from: sp.from === "" ? undefined : sp.from ?? monthStart(), to: sp.to };
  const [rows, m] = await Promise.all([listAdvances(range), getMasters()]);
  return (
    <EntryPage title="Advances" sub="Cash advances given to workers" kind="advances" rows={rows} range={range} totalKey="amount" addLabel="Add advance"
      form={
        <ActionForm action={addAdvance} keep={["date"]}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" name="date" defaultValue={todayISO()} required /></Field>
            <Field label="Amount (₹)"><Input type="number" name="amount" inputMode="decimal" min={1} required /></Field>
          </div>
          <Field label="Worker"><Pick name="workerId" options={m.workers} required /></Field>
          <Field label="Site (optional)"><Pick name="siteId" options={m.sites} placeholder="—" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Paid by"><Input name="paidBy" placeholder="Cash / UPI" list="paidby" /><datalist id="paidby"><option>Cash</option><option>UPI</option><option>Bank Transfer</option></datalist></Field>
            <Field label="Note"><Input name="note" /></Field>
          </div>
        </ActionForm>}
      cols={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
        { key: "worker", label: "Worker", render: (r) => <>{r.worker} <Badge tone={r.type === "Mason" ? "blue" : "gray"}>{r.type}</Badge></> },
        { key: "site", label: "Site" },
        { key: "amount", label: "Amount", num: true, render: (r) => inr(r.amount) },
        { key: "paidBy", label: "Paid by" }, { key: "note", label: "Note" },
      ]} />
  );
}
