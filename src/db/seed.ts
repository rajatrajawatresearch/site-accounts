import { db } from "./index";
import { users, sites, workers, suppliers, materials } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin123";
  const existing = await db.select().from(users).limit(1);
  if (existing.length === 0) {
    await db.insert(users).values([
      { name: "Administrator", username: adminUser, passwordHash: await bcrypt.hash(adminPass, 10), role: "admin" },
      { name: "Site Manager", username: "manager", passwordHash: await bcrypt.hash("manager123", 10), role: "manager" },
      { name: "Viewer", username: "viewer", passwordHash: await bcrypt.hash("viewer123", 10), role: "viewer" },
    ]);
    console.log(`Users created: ${adminUser}/${adminPass}, manager/manager123, viewer/viewer123`);
  }
  if ((await db.select().from(materials).limit(1)).length === 0) {
    await db.insert(materials).values([
      { name: "Sand", unit: "Brass" }, { name: "Aggregate", unit: "Brass" }, { name: "Cement", unit: "Bag" },
      { name: "Bricks", unit: "Nos" }, { name: "Steel", unit: "Kg" }, { name: "Tiles", unit: "Box" },
    ]);
  }
  if (process.env.SEED_SAMPLE === "1") {
    await db.insert(sites).values([
      { name: "Shiv Residency", clientName: "Rajesh Patel", contractValue: 4500000 },
      { name: "Krishna Bungalow", clientName: "Mehul Shah", contractValue: 2800000 },
    ]).onConflictDoNothing();
    await db.insert(workers).values([
      { name: "Ramesh", type: "Mason", dailyRate: 900 }, { name: "Suresh", type: "Mason", dailyRate: 850 }, { name: "Mohan", type: "Labour", dailyRate: 500 },
    ]).onConflictDoNothing();
    await db.insert(suppliers).values([
      { name: "Ambika Sand Supplier" }, { name: "Jay Cement Agency" }, { name: "Shree Ram Steel" },
    ]).onConflictDoNothing();
  }
  console.log("Seed done");
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
