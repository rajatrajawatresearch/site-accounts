"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sites, workers, suppliers, materials } from "@/db/schema";
import { requirePermission } from "@/lib/auth";

export type ActionState = { error?: string; ok?: boolean };

const money = z.coerce.number().min(0);

function fail(e: unknown): ActionState {
  const msg = e instanceof z.ZodError ? e.issues.map((i) => i.message).join(", ") : e instanceof Error ? e.message : "Failed";
  return { error: msg.includes("UNIQUE") ? "Name already exists" : msg };
}

export async function saveSite(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("masters.write");
    const d = z.object({ id: z.coerce.number().optional(), name: z.string().trim().min(1, "Site name required"), clientName: z.string().trim().min(1, "Client required"), contractValue: money }).parse(Object.fromEntries(fd));
    if (d.id) await db.update(sites).set(d).where(eq(sites.id, d.id)); else await db.insert(sites).values(d);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function saveWorker(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("masters.write");
    const d = z.object({ id: z.coerce.number().optional(), name: z.string().trim().min(1, "Worker name required"), type: z.enum(["Mason", "Labour"]), dailyRate: money, phone: z.string().trim().optional() }).parse(Object.fromEntries(fd));
    if (d.id) await db.update(workers).set(d).where(eq(workers.id, d.id)); else await db.insert(workers).values(d);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function saveSupplier(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("masters.write");
    const d = z.object({ id: z.coerce.number().optional(), name: z.string().trim().min(1, "Supplier name required"), phone: z.string().trim().optional() }).parse(Object.fromEntries(fd));
    if (d.id) await db.update(suppliers).set(d).where(eq(suppliers.id, d.id)); else await db.insert(suppliers).values(d);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function saveMaterial(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("masters.write");
    const d = z.object({ id: z.coerce.number().optional(), name: z.string().trim().min(1, "Material required"), unit: z.string().trim().min(1, "Unit required") }).parse(Object.fromEntries(fd));
    if (d.id) await db.update(materials).set(d).where(eq(materials.id, d.id)); else await db.insert(materials).values(d);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function toggleActive(kind: "site" | "worker" | "supplier", id: number, active: boolean) {
  await requirePermission("masters.write");
  const t = kind === "site" ? sites : kind === "worker" ? workers : suppliers;
  await db.update(t).set({ active }).where(eq(t.id, id));
  revalidatePath("/", "layout");
}
