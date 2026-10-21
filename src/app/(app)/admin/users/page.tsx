import { db } from "@/db";
import { users } from "@/db/schema";
import { requirePermission } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import { UsersAdmin } from "./admin";
import { redirect } from "next/navigation";

export default async function Page() {
  try { await requirePermission("users.manage"); } catch { redirect("/"); }
  const list = await db.select({ id: users.id, name: users.name, username: users.username, role: users.role, active: users.active, createdAt: users.createdAt }).from(users).orderBy(users.name);
  return (
    <>
      <PageHeader title="Users & Roles" sub="Admin: full access · Manager: all entries and setup · Viewer: read only" />
      <Card className="px-4 md:px-0"><UsersAdmin list={list} /></Card>
    </>
  );
}
