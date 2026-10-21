import Link from "next/link";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { Card, PageHeader } from "@/components/ui";
import { logoutAction } from "@/actions/auth";

export default async function More() {
  const s = await getSession();
  const items = [
    ["/material", "Material Bills", "Purchase bills per site & supplier"],
    ["/supplier-payments", "Supplier Payments", "Money paid to suppliers"],
    ["/client-payments", "Client Payments", "Money received from clients"],
    ["/ledgers/workers", "Worker Ledger", "Wages − advances = balance"],
    ["/ledgers/suppliers", "Supplier Ledger", "Bills − paid = outstanding"],
    ["/ledgers/sites", "Site Summary", "Profit / loss per site"],
    ["/setup", "Setup", "Sites, workers, suppliers, materials"],
    ["/account", "My account", "Change password"],
    ...(can(s?.role, "users.manage") ? [["/admin/users", "Users & Roles", "Admin panel"]] : []),
  ];
  return (
    <>
      <PageHeader title="More" />
      <Card>
        {items.map(([h, t, d]) => <Link key={h} href={h} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 active:bg-muted"><div><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div><span className="text-muted-foreground/60">›</span></Link>)}
      </Card>
      <form action={logoutAction} className="mt-4"><button className="w-full h-11 rounded-xl border border-input text-sm text-danger bg-card">Sign out</button></form>
    </>
  );
}
