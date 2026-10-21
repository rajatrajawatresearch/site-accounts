"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { attendance, advances, materialBills, supplierPayments, clientPayments, workers } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import type { ActionState } from "./masters";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date required");
const id = z.coerce.number().int().positive("Select an option");
const amount = z.coerce.number().positive("Amount must be > 0");
const opt = z.string().trim().optional().transform((v) => (v ? v : null));

function fail(e: unknown): ActionState {
  return { error: e instanceof z.ZodError ? e.issues.map((i) => i.message).join(", ") : e instanceof Error ? e.message : "Failed" };
}
const DAYS = { "Full Day": 1, "Half Day": 0.5, Absent: 0 } as const;

export async function addAttendance(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, workerId: id, siteId: id, status: z.enum(["Full Day", "Half Day", "Absent"]), note: opt }).parse(Object.fromEntries(fd));
    const [w] = await db.select().from(workers).where(eq(workers.id, d.workerId));
    if (!w) return { error: "Worker not found" };
    const days = DAYS[d.status];
    await db.insert(attendance).values({ ...d, days, rate: w.dailyRate, wage: days * w.dailyRate, createdBy: s.id });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function addBulkAttendance(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, siteId: id }).parse({ date: fd.get("date"), siteId: fd.get("siteId") });
    const rows: typeof attendance.$inferInsert[] = [];
    const all = await db.select().from(workers);
    for (const w of all) {
      const st = fd.get(`w_${w.id}`);
      if (!st || typeof st !== "string" || !(st in DAYS)) continue;
      const days = DAYS[st as keyof typeof DAYS];
      rows.push({ date: d.date, siteId: d.siteId, workerId: w.id, status: st as keyof typeof DAYS, days, rate: w.dailyRate, wage: days * w.dailyRate, createdBy: s.id });
    }
    if (rows.length === 0) return { error: "Mark at least one worker" };
    await db.insert(attendance).values(rows);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function addAdvance(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, workerId: id, siteId: z.coerce.number().optional().transform((v) => (v ? v : null)), amount, paidBy: opt, note: opt }).parse(Object.fromEntries(fd));
    await db.insert(advances).values({ ...d, createdBy: s.id });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function addMaterialBill(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, billNo: opt, siteId: id, supplierId: id, materialId: id, quantity: amount, rate: z.coerce.number().min(0), extra: z.coerce.number().min(0).default(0), note: opt }).parse(Object.fromEntries(fd));
    await db.insert(materialBills).values({ ...d, total: d.quantity * d.rate + d.extra, createdBy: s.id });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function addSupplierPayment(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, supplierId: id, amount, paidBy: opt, billNo: opt, note: opt }).parse(Object.fromEntries(fd));
    await db.insert(supplierPayments).values({ ...d, createdBy: s.id });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function addClientPayment(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const s = await requirePermission("entries.write");
    const d = z.object({ date, siteId: id, amount, receivedBy: opt, note: opt }).parse(Object.fromEntries(fd));
    await db.insert(clientPayments).values({ ...d, createdBy: s.id });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

const TABLES = { attendance, advances, material: materialBills, supplierPayments, clientPayments } as const;
export type EntryKind = keyof typeof TABLES;

export async function deleteEntry(kind: EntryKind, entryId: number) {
  await requirePermission("entries.write");
  const t = TABLES[kind];
  await db.delete(t).where(eq(t.id, entryId));
  revalidatePath("/", "layout");
}
