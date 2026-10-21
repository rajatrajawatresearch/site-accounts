"use client";
import { useRouter } from "next/navigation";
import { createUser, setUserRole, setUserActive, resetPassword } from "@/actions/users";
import { ActionForm, Sheet } from "@/components/forms";
import { Field, Input, Select, Button, Badge, Table, th, td, Empty } from "@/components/ui";
import { ROLES, type Role } from "@/db/schema";
import { ROLE_LABEL } from "@/lib/rbac";

type U = { id: number; name: string; username: string; role: Role; active: boolean };

export function UsersAdmin({ list }: { list: U[] }) {
  const router = useRouter();
  const run = async (fn: () => Promise<void>) => { try { await fn(); router.refresh(); } catch (e) { alert(e instanceof Error ? e.message : "Failed"); } };
  return (
    <>
      <div className="flex items-center justify-between py-3 md:px-4">
        <div className="font-semibold">Users <span className="text-muted-foreground font-normal text-sm">({list.length})</span></div>
        <Sheet title="Create user" trigger={<Button className="bg-primary hover:bg-primary/90 h-9">+ New user</Button>}>{(close) => (
          <ActionForm action={createUser} onDone={close} submit="Create user">
            <Field label="Full name"><Input name="name" required /></Field>
            <Field label="Username" hint="Lowercase, no spaces"><Input name="username" autoCapitalize="none" required /></Field>
            <Field label="Password"><Input name="password" type="text" autoComplete="new-password" required minLength={6} /></Field>
            <Field label="Role"><Select name="role" defaultValue="manager">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</Select></Field>
          </ActionForm>)}</Sheet>
      </div>
      {list.length === 0 ? <Empty text="No users." /> : (
        <Table>
          <thead><tr><th className={th}>Name</th><th className={th}>Username</th><th className={th}>Role</th><th className={th}>Status</th><th className={th} /></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id} className={!u.active ? "opacity-60" : ""}>
              <td className={td + " font-medium"}>{u.name}</td><td className={td + " font-mono text-xs"}>{u.username}</td>
              <td className={td}><select value={u.role} onChange={(e) => run(() => setUserRole(u.id, e.target.value as Role))} className="h-8 rounded-lg border border-input bg-card px-2 text-xs">{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></td>
              <td className={td}><Badge tone={u.active ? "green" : "red"}>{u.active ? "Active" : "Disabled"}</Badge></td>
              <td className={td + " text-right whitespace-nowrap"}>
                <Sheet title={`Reset password · ${u.username}`} trigger={<button className="text-xs text-primary mr-3">Reset password</button>}>{(close) => (
                  <ActionForm action={resetPassword} onDone={close} submit="Set password"><input type="hidden" name="userId" value={u.id} /><Field label="New password"><Input name="password" type="text" required minLength={6} /></Field></ActionForm>)}</Sheet>
                <button onClick={() => run(() => setUserActive(u.id, !u.active))} className="text-xs text-muted-foreground">{u.active ? "Disable" : "Enable"}</button>
              </td>
            </tr>))}</tbody>
        </Table>)}
    </>
  );
}
