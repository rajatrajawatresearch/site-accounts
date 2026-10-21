"use client";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Button, Field, Input } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Username"><Input name="username" autoComplete="username" autoCapitalize="none" required /></Field>
      <Field label="Password"><Input name="password" type="password" autoComplete="current-password" required /></Field>
      {state.error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
