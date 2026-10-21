"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, ROLES } from "@/db/schema";
import { requirePermission, requireSession } from "@/lib/auth";
import type { ActionState } from "./masters";

export async function createUser(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("users.manage");
    const d = z.object({
      name: z.string().trim().min(1, "Name required"),
      username: z.string().trim().toLowerCase().min(3, "Username min 3 chars").regex(/^[a-z0-9._]+$/, "Username: letters, numbers, . _ only"),
      password: z.string().min(6, "Password min 6 chars"),
      role: z.enum(ROLES),
    }).parse(Object.fromEntries(fd));
    await db.insert(users).values({ name: d.name, username: d.username, role: d.role, passwordHash: await bcrypt.hash(d.password, 10) });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues.map((i) => i.message).join(", ") : e instanceof Error ? e.message : "Failed";
    return { error: msg.includes("UNIQUE") ? "Username already taken" : msg };
  }
}

export async function setUserRole(userId: number, role: (typeof ROLES)[number]) {
  const me = await requirePermission("users.manage");
  if (me.id === userId) throw new Error("You cannot change your own role");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function setUserActive(userId: number, active: boolean) {
  const me = await requirePermission("users.manage");
  if (me.id === userId) throw new Error("You cannot deactivate yourself");
  await db.update(users).set({ active }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function resetPassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requirePermission("users.manage");
    const d = z.object({ userId: z.coerce.number(), password: z.string().min(6, "Password min 6 chars") }).parse(Object.fromEntries(fd));
    await db.update(users).set({ passwordHash: await bcrypt.hash(d.password, 10) }).where(eq(users.id, d.userId));
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) { return { error: e instanceof z.ZodError ? e.issues.map((i) => i.message).join(", ") : "Failed" }; }
}

export async function changeOwnPassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const me = await requireSession();
    const d = z.object({ current: z.string(), password: z.string().min(6, "New password min 6 chars") }).parse(Object.fromEntries(fd));
    const [u] = await db.select().from(users).where(eq(users.id, me.id));
    if (!u || !(await bcrypt.compare(d.current, u.passwordHash))) return { error: "Current password is wrong" };
    await db.update(users).set({ passwordHash: await bcrypt.hash(d.password, 10) }).where(eq(users.id, me.id));
    return { ok: true };
  } catch (e) { return { error: e instanceof z.ZodError ? e.issues.map((i) => i.message).join(", ") : "Failed" }; }
}
