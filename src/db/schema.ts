import { pgTable, text, integer, doublePrecision, boolean, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const ROLES = ["admin", "manager", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const roleEnum = pgEnum("role", ROLES);
export const workerTypeEnum = pgEnum("worker_type", ["Mason", "Labour"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["Full Day", "Half Day", "Absent"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("viewer"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  clientName: text("client_name").notNull(),
  contractValue: doublePrecision("contract_value").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: workerTypeEnum("type").notNull(),
  dailyRate: doublePrecision("daily_rate").notNull().default(0),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  phone: text("phone"),
  active: boolean("active").notNull().default(true),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  workerId: integer("worker_id").notNull().references(() => workers.id),
  siteId: integer("site_id").notNull().references(() => sites.id),
  status: attendanceStatusEnum("status").notNull(),
  days: doublePrecision("days").notNull(), // 1 / 0.5 / 0
  rate: doublePrecision("rate").notNull(), // snapshot of worker rate on that day
  wage: doublePrecision("wage").notNull(),
  note: text("note"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const advances = pgTable("advances", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  workerId: integer("worker_id").notNull().references(() => workers.id),
  siteId: integer("site_id").references(() => sites.id),
  amount: doublePrecision("amount").notNull(),
  paidBy: text("paid_by"),
  note: text("note"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const materialBills = pgTable("material_bills", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  billNo: text("bill_no"),
  siteId: integer("site_id").notNull().references(() => sites.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  materialId: integer("material_id").notNull().references(() => materials.id),
  quantity: doublePrecision("quantity").notNull(),
  rate: doublePrecision("rate").notNull(),
  extra: doublePrecision("extra").notNull().default(0),
  total: doublePrecision("total").notNull(),
  note: text("note"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const supplierPayments = pgTable("supplier_payments", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  amount: doublePrecision("amount").notNull(),
  paidBy: text("paid_by"),
  billNo: text("bill_no"),
  note: text("note"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clientPayments = pgTable("client_payments", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  siteId: integer("site_id").notNull().references(() => sites.id),
  amount: doublePrecision("amount").notNull(),
  receivedBy: text("received_by"),
  note: text("note"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
