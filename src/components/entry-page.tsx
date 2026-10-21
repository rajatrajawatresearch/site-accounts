import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageHeader, Card, Table, th, td, tdn, Empty } from "@/components/ui";
import { RangeFilter, AddSheet, DeleteEntryButton } from "@/components/forms";
import type { EntryKind } from "@/actions/entries";
import { inr } from "@/lib/format";
import type { ReactNode } from "react";

export type Col<T> = { key: keyof T | string; label: string; num?: boolean; render?: (r: T) => ReactNode };

export async function EntryPage<T extends { id: number }>({ title, sub, kind, rows, cols, range, form, totalKey, addLabel = "Add" }: {
  title: string; sub?: string; kind: EntryKind; rows: T[]; cols: Col<T>[]; range: { from?: string; to?: string }; form: ReactNode; totalKey?: keyof T; addLabel?: string;
}) {
  const s = await requireSession();
  const w = can(s.role, "entries.write");
  const total = totalKey ? rows.reduce((a, r) => a + Number(r[totalKey] ?? 0), 0) : null;
  return (
    <>
      <PageHeader title={title} sub={sub} action={w && <AddSheet title={addLabel}>{form}</AddSheet>} />
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <RangeFilter from={range.from} to={range.to} />
        {total !== null && <div className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground num">{inr(total)}</span> · {rows.length} entries</div>}
      </div>
      <Card className="px-4 md:px-0">
        {rows.length === 0 ? <Empty text="No entries in this range." /> : (
          <Table>
            <thead><tr>{cols.map((c) => <th key={String(c.key)} className={th + (c.num ? " text-right" : "")}>{c.label}</th>)}{w && <th className={th} />}</tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50">
                {cols.map((c) => <td key={String(c.key)} className={c.num ? tdn : td}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key as string] ?? "")}</td>)}
                {w && <td className={td + " text-right"}><DeleteEntryButton kind={kind} id={r.id} /></td>}
              </tr>
            ))}</tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
