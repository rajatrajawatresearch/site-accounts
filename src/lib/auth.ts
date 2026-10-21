import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type Role } from "@/db/schema";
import { can, type Permission } from "./rbac";

const COOKIE = "sa_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32chars!");

export type Session = { id: number; name: string; username: string; role: Role };

export async function signIn(username: string, password: string): Promise<Session | null> {
  const [u] = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
  if (!u || !u.active) return null;
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return null;
  const session: Session = { id: u.id, name: u.name, username: u.username, role: u.role };
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return session;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.id as number, name: payload.name as string, username: payload.username as string, role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requirePermission(perm: Permission): Promise<Session> {
  const s = await requireSession();
  if (!can(s.role, perm)) throw new Error("Not allowed: " + perm);
  return s;
}
