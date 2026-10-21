import { LoginForm } from "./form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="min-h-dvh grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-sidebar text-sidebar-foreground p-10">
        <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary grid place-items-center font-bold text-lg">S</div><span className="font-semibold text-lg">Site Accounts</span></div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight leading-tight">Daily attendance, advances,<br />material and site profit.<br />One place.</h2>
          <p className="text-sidebar-foreground/60 mt-4 max-w-md">Replaces the Excel. Workers, suppliers and clients stay in sync automatically.</p>
        </div>
        <div className="text-xs text-sidebar-foreground/40">© {new Date().getFullYear()} Site Accounts</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-8"><div className="h-10 w-10 rounded-xl bg-primary grid place-items-center font-bold text-lg text-white">S</div><span className="font-semibold text-lg">Site Accounts</span></div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Use the username and password given to you.</p>
          <LoginForm next={next ?? "/"} />
        </div>
      </div>
    </div>
  );
}
