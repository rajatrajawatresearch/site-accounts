# Site Accounts

Construction site accounting for a site-contractor business: daily attendance, worker advances,
material bills, supplier and client payments, and automatic worker / supplier / site ledgers.
Replaces the `Site_Accounts.xlsx` workbook with a mobile-first web app (installable as a PWA).

## Stack
- Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind v4
- Drizzle ORM on Postgres: **Neon** in production, **PGlite** (embedded Postgres) in local dev
- Auth: username + password (bcrypt), JWT session cookie (jose), 30 days
- RBAC: `admin` (everything + users), `manager` (all entries + setup), `viewer` (read only)
- Theme: light / dark + 5 accent colours (orange, blue, green, violet, rose), saved per device

## Local development
```bash
pnpm install
pnpm setup          # creates schema in ./data/pglite and seeds users
pnpm dev
```
Default users after seed: `admin / admin123`, `manager / manager123`, `viewer / viewer123`.
Change these from **Admin → Users & Roles** after first login.

`SEED_SAMPLE=1 pnpm db:seed` adds example sites / workers / suppliers (dev only).

## Deploy on Vercel + Neon (free tiers)
1. Create a Neon project → copy the pooled connection string.
2. In Vercel project settings → Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `AUTH_SECRET` = any random 32+ character string
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` = first admin login (used once by seed)
3. Push schema and seed from your machine against Neon:
   ```bash
   DATABASE_URL="postgres://..." pnpm db:push
   DATABASE_URL="postgres://..." ADMIN_USERNAME=admin ADMIN_PASSWORD='strong-pass' pnpm db:seed
   ```
4. Deploy (`vercel --prod` or Git integration).

## Structure
```
src/db/schema.ts        tables + enums (users, sites, workers, suppliers, materials, 5 ledgers)
src/db/index.ts         driver switch: Neon (DATABASE_URL) or PGlite (local)
src/lib/auth.ts         session, requireSession, requirePermission
src/lib/rbac.ts         permission matrix
src/lib/queries.ts      list queries + worker/supplier/site ledgers + dashboard
src/actions/*.ts        server actions (zod-validated, permission-checked)
src/app/(app)/*         authenticated screens
src/app/admin/users     admin panel
src/proxy.ts            auth redirect for all routes
```
