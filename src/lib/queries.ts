import "server-only";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { attendance, advances, materialBills, supplierPayments, clientPayments, sites, workers, suppliers, materials } from "@/db/schema";

export type Range = { from?: string; to?: string };
const inRange = (col: PgColumn, r: Range) => and(r.from ? gte(col, r.from) : undefined, r.to ? lte(col, r.to) : undefined);

export async function getMasters() {
  const [s, w, sp, m] = await Promise.all([
    db.select().from(sites).orderBy(sites.name),
    db.select().from(workers).orderBy(workers.name),
    db.select().from(suppliers).orderBy(suppliers.name),
    db.select().from(materials).orderBy(materials.name),
  ]);
  return { sites: s, workers: w, suppliers: sp, materials: m };
}

export async function listAttendance(r: Range, limit = 200) {
  return db.select({ id: attendance.id, date: attendance.date, worker: workers.name, type: workers.type, site: sites.name, status: attendance.status, days: attendance.days, rate: attendance.rate, wage: attendance.wage, note: attendance.note })
    .from(attendance).innerJoin(workers, eq(attendance.workerId, workers.id)).innerJoin(sites, eq(attendance.siteId, sites.id))
    .where(inRange(attendance.date, r)).orderBy(desc(attendance.date), desc(attendance.id)).limit(limit);
}
export async function listAdvances(r: Range, limit = 200) {
  return db.select({ id: advances.id, date: advances.date, worker: workers.name, type: workers.type, site: sites.name, amount: advances.amount, paidBy: advances.paidBy, note: advances.note })
    .from(advances).innerJoin(workers, eq(advances.workerId, workers.id)).leftJoin(sites, eq(advances.siteId, sites.id))
    .where(inRange(advances.date, r)).orderBy(desc(advances.date), desc(advances.id)).limit(limit);
}
export async function listMaterialBills(r: Range, limit = 200) {
  return db.select({ id: materialBills.id, date: materialBills.date, billNo: materialBills.billNo, site: sites.name, supplier: suppliers.name, material: materials.name, unit: materials.unit, quantity: materialBills.quantity, rate: materialBills.rate, extra: materialBills.extra, total: materialBills.total, note: materialBills.note })
    .from(materialBills).innerJoin(sites, eq(materialBills.siteId, sites.id)).innerJoin(suppliers, eq(materialBills.supplierId, suppliers.id)).innerJoin(materials, eq(materialBills.materialId, materials.id))
    .where(inRange(materialBills.date, r)).orderBy(desc(materialBills.date), desc(materialBills.id)).limit(limit);
}
export async function listSupplierPayments(r: Range, limit = 200) {
  return db.select({ id: supplierPayments.id, date: supplierPayments.date, supplier: suppliers.name, amount: supplierPayments.amount, paidBy: supplierPayments.paidBy, billNo: supplierPayments.billNo, note: supplierPayments.note })
    .from(supplierPayments).innerJoin(suppliers, eq(supplierPayments.supplierId, suppliers.id))
    .where(inRange(supplierPayments.date, r)).orderBy(desc(supplierPayments.date), desc(supplierPayments.id)).limit(limit);
}
export async function listClientPayments(r: Range, limit = 200) {
  return db.select({ id: clientPayments.id, date: clientPayments.date, site: sites.name, client: sites.clientName, amount: clientPayments.amount, receivedBy: clientPayments.receivedBy, note: clientPayments.note })
    .from(clientPayments).innerJoin(sites, eq(clientPayments.siteId, sites.id))
    .where(inRange(clientPayments.date, r)).orderBy(desc(clientPayments.date), desc(clientPayments.id)).limit(limit);
}

export async function workerLedger(r: Range) {
  const att = db.select({ workerId: attendance.workerId, days: sql<number>`coalesce(sum(${attendance.days}),0)`.as("days"), wages: sql<number>`coalesce(sum(${attendance.wage}),0)`.as("wages") }).from(attendance).where(inRange(attendance.date, r)).groupBy(attendance.workerId).as("att");
  const adv = db.select({ workerId: advances.workerId, adv: sql<number>`coalesce(sum(${advances.amount}),0)`.as("adv") }).from(advances).where(inRange(advances.date, r)).groupBy(advances.workerId).as("adv");
  const rows = await db.select({ id: workers.id, name: workers.name, type: workers.type, rate: workers.dailyRate, active: workers.active, days: sql<number>`coalesce(${att.days},0)`, wages: sql<number>`coalesce(${att.wages},0)`, advances: sql<number>`coalesce(${adv.adv},0)` })
    .from(workers).leftJoin(att, eq(att.workerId, workers.id)).leftJoin(adv, eq(adv.workerId, workers.id)).orderBy(workers.name);
  return rows.map((x) => ({ ...x, balance: x.wages - x.advances }));
}

export async function supplierLedger() {
  const bills = db.select({ supplierId: materialBills.supplierId, bills: sql<number>`coalesce(sum(${materialBills.total}),0)`.as("bills") }).from(materialBills).groupBy(materialBills.supplierId).as("b");
  const paid = db.select({ supplierId: supplierPayments.supplierId, paid: sql<number>`coalesce(sum(${supplierPayments.amount}),0)`.as("paid") }).from(supplierPayments).groupBy(supplierPayments.supplierId).as("p");
  const rows = await db.select({ id: suppliers.id, name: suppliers.name, phone: suppliers.phone, active: suppliers.active, bills: sql<number>`coalesce(${bills.bills},0)`, paid: sql<number>`coalesce(${paid.paid},0)` })
    .from(suppliers).leftJoin(bills, eq(bills.supplierId, suppliers.id)).leftJoin(paid, eq(paid.supplierId, suppliers.id)).orderBy(suppliers.name);
  return rows.map((x) => ({ ...x, outstanding: x.bills - x.paid }));
}

export async function siteSummary() {
  const recv = db.select({ siteId: clientPayments.siteId, received: sql<number>`coalesce(sum(${clientPayments.amount}),0)`.as("received") }).from(clientPayments).groupBy(clientPayments.siteId).as("r");
  const mat = db.select({ siteId: materialBills.siteId, material: sql<number>`coalesce(sum(${materialBills.total}),0)`.as("material") }).from(materialBills).groupBy(materialBills.siteId).as("m");
  const lab = db.select({ siteId: attendance.siteId, labour: sql<number>`coalesce(sum(${attendance.wage}),0)`.as("labour") }).from(attendance).groupBy(attendance.siteId).as("l");
  const rows = await db.select({ id: sites.id, name: sites.name, client: sites.clientName, contract: sites.contractValue, active: sites.active, received: sql<number>`coalesce(${recv.received},0)`, material: sql<number>`coalesce(${mat.material},0)`, labour: sql<number>`coalesce(${lab.labour},0)` })
    .from(sites).leftJoin(recv, eq(recv.siteId, sites.id)).leftJoin(mat, eq(mat.siteId, sites.id)).leftJoin(lab, eq(lab.siteId, sites.id)).orderBy(sites.name);
  return rows.map((x) => ({ ...x, balanceFromClient: x.contract > 0 ? x.contract - x.received : 0, totalCost: x.material + x.labour, profit: x.received - x.material - x.labour }));
}

export async function dashboard(today: string) {
  const [todayAtt] = await db.select({ masons: sql<number>`coalesce(sum(case when ${workers.type}='Mason' and ${attendance.days}>0 then 1 else 0 end),0)`, labour: sql<number>`coalesce(sum(case when ${workers.type}='Labour' and ${attendance.days}>0 then 1 else 0 end),0)`, wages: sql<number>`coalesce(sum(${attendance.wage}),0)` })
    .from(attendance).innerJoin(workers, eq(attendance.workerId, workers.id)).where(eq(attendance.date, today));
  const [todayAdv] = await db.select({ amt: sql<number>`coalesce(sum(${advances.amount}),0)` }).from(advances).where(eq(advances.date, today));
  const [todayMat] = await db.select({ amt: sql<number>`coalesce(sum(${materialBills.total}),0)` }).from(materialBills).where(eq(materialBills.date, today));
  const [wl, sl, ss] = await Promise.all([workerLedger({}), supplierLedger(), siteSummary()]);
  return {
    today: { masons: todayAtt?.masons ?? 0, labour: todayAtt?.labour ?? 0, wages: todayAtt?.wages ?? 0, advances: todayAdv?.amt ?? 0, material: todayMat?.amt ?? 0 },
    workersDue: wl.reduce((a, x) => a + Math.max(x.balance, 0), 0),
    suppliersDue: sl.reduce((a, x) => a + Math.max(x.outstanding, 0), 0),
    clientPending: ss.reduce((a, x) => a + x.balanceFromClient, 0),
    received: ss.reduce((a, x) => a + x.received, 0),
    cost: ss.reduce((a, x) => a + x.totalCost, 0),
    profit: ss.reduce((a, x) => a + x.profit, 0),
    sites: ss, topWorkers: wl.filter((x) => x.balance !== 0).sort((a, b) => b.balance - a.balance).slice(0, 5), topSuppliers: sl.filter((x) => x.outstanding !== 0).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5),
  };
}
