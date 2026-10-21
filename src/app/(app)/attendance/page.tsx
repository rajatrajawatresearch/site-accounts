import { listAttendance, getMasters } from "@/lib/queries";
import { EntryPage } from "@/components/entry-page";
import { AttendanceForm } from "./form";
import { Badge } from "@/components/ui";
import { fmtDate, inr, monthStart, todayISO } from "@/lib/format";

export default async function Page({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams;
  const range = { from: sp.from === "" ? undefined : sp.from ?? monthStart(), to: sp.to };
  const [rows, m] = await Promise.all([listAttendance(range), getMasters()]);
  return (
    <EntryPage title="Attendance" sub="Daily attendance of masons and labour" kind="attendance" rows={rows} range={range} totalKey="wage" addLabel="Mark attendance"
      form={<AttendanceForm sites={m.sites} workers={m.workers} today={todayISO()} />}
      cols={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
        { key: "worker", label: "Worker", render: (r) => <>{r.worker} <Badge tone={r.type === "Mason" ? "blue" : "gray"}>{r.type}</Badge></> },
        { key: "site", label: "Site" },
        { key: "status", label: "Attendance", render: (r) => <Badge tone={r.days === 1 ? "green" : r.days === 0.5 ? "amber" : "red"}>{r.status}</Badge> },
        { key: "days", label: "Days", num: true },
        { key: "rate", label: "Rate", num: true, render: (r) => inr(r.rate) },
        { key: "wage", label: "Wage", num: true, render: (r) => inr(r.wage) },
        { key: "note", label: "Note" },
      ]} />
  );
}
