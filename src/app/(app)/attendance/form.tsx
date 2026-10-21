"use client";
import { useState } from "react";
import { addBulkAttendance } from "@/actions/entries";
import { ActionForm } from "@/components/forms";
import { Field, Input, cn } from "@/components/ui";
import { Pick } from "@/components/pickers";

type W = { id: number; name: string; type: string; dailyRate: number; active: boolean };
const OPTS = ["Full Day", "Half Day", "Absent"] as const;

export function AttendanceForm({ sites, workers, today }: { sites: { id: number; name: string; active: boolean }[]; workers: W[]; today: string }) {
  const [marks, setMarks] = useState<Record<number, string>>({});
  const active = workers.filter((w) => w.active);
  const setAll = (v: string) => setMarks(Object.fromEntries(active.map((w) => [w.id, v])));
  return (
    <ActionForm action={addBulkAttendance} submit="Save attendance" keep={["date", "siteId"]} onDone={() => setMarks({})}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><Input type="date" name="date" defaultValue={today} required /></Field>
        <Field label="Site"><Pick name="siteId" options={sites} required /></Field>
      </div>
      <div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">Workers</span><div className="flex gap-2 text-xs"><button type="button" onClick={() => setAll("Full Day")} className="text-primary">All full</button><button type="button" onClick={() => setMarks({})} className="text-muted-foreground">Clear</button></div></div>
      <div className="divide-y divide-border rounded-xl border border-border max-h-[45dvh] overflow-y-auto">
        {active.map((w) => (
          <div key={w.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0"><div className="text-sm font-medium truncate">{w.name}</div><div className="text-[11px] text-muted-foreground">{w.type} · ₹{w.dailyRate}/day</div></div>
            <input type="hidden" name={`w_${w.id}`} value={marks[w.id] ?? ""} />
            <div className="flex rounded-lg border border-input overflow-hidden shrink-0">
              {OPTS.map((o) => <button key={o} type="button" onClick={() => setMarks((m) => ({ ...m, [w.id]: m[w.id] === o ? "" : o }))}
                className={cn("px-2.5 h-9 text-xs font-medium border-r last:border-r-0 border-input", marks[w.id] === o ? (o === "Full Day" ? "bg-success text-white" : o === "Half Day" ? "bg-warning/100 text-white" : "bg-danger/100 text-white") : "bg-card text-foreground/80")}>{o === "Full Day" ? "Full" : o === "Half Day" ? "Half" : "Abs"}</button>)}
            </div>
          </div>
        ))}
        {active.length === 0 && <div className="p-4 text-sm text-muted-foreground">Add workers in Setup first.</div>}
      </div>
    </ActionForm>
  );
}
