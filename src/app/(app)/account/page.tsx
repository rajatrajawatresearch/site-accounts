import { requireSession } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { PageHeader, Card, Badge, Field, Input } from "@/components/ui";
import { ActionForm } from "@/components/forms";
import { changeOwnPassword } from "@/actions/users";
import { logoutAction } from "@/actions/auth";
import { ThemeControls } from "@/components/theme";

export default async function Page() {
  const s = await requireSession();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4"><div className="h-14 w-14 rounded-2xl bg-sidebar text-sidebar-foreground grid place-items-center text-xl font-semibold">{s.name[0]?.toUpperCase()}</div><div><div className="font-semibold text-lg">{s.name}</div><div className="text-sm text-muted-foreground font-mono">{s.username}</div><Badge tone="blue">{ROLE_LABEL[s.role]}</Badge></div></div>
          <form action={logoutAction} className="mt-5"><button className="h-10 px-4 rounded-xl border border-input text-sm text-danger bg-card">Sign out</button></form>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Change password</h3>
          <ActionForm action={changeOwnPassword} submit="Update password">
            <Field label="Current password"><Input name="current" type="password" autoComplete="current-password" required /></Field>
            <Field label="New password"><Input name="password" type="password" autoComplete="new-password" required minLength={6} /></Field>
          </ActionForm>
        </Card>
      </div>
      <Card className="p-5 mt-4"><h3 className="font-semibold mb-3">Appearance</h3><p className="text-xs text-muted-foreground mb-3">Pick an accent colour and light or dark mode. Saved on this device.</p><ThemeControls /></Card>
      <p className="text-xs text-muted-foreground mt-6">Tip: on your phone open this site in Chrome / Safari and choose “Add to Home Screen” to install it as an app.</p>
    </>
  );
}
