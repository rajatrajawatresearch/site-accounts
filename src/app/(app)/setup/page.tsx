import { getMasters } from "@/lib/queries";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import { SetupTabs } from "./tabs";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const [m, s] = await Promise.all([getMasters(), requireSession()]);
  return (
    <>
      <PageHeader title="Setup" sub="Master lists. Fill these first; every entry screen picks from here." />
      <SetupTabs masters={m} canWrite={can(s.role, "masters.write")} tab={tab ?? "sites"} />
    </>
  );
}
