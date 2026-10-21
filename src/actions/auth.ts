"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export type AuthState = { error?: string };

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  if (!username || !password) return { error: "Enter username and password" };
  const s = await signIn(username, password);
  if (!s) return { error: "Wrong username or password" };
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}
