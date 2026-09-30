import { asc, eq } from "drizzle-orm";
import { branches, businessSettings, cashAccounts, warehouses } from "../drizzle/schema";
import { getDb } from "./db";

export async function ensureOperationalDefaults() {
  const db = await getDb();
  if (!db) return;

  const existingBranches = await db.select().from(branches).limit(1);
  if (!existingBranches[0]) {
    await db.insert(branches).values({ name: "الفرع الرئيسي", code: "MAIN", color: "#214696", address: "الفرع الرئيسي" });
  }
  const mainBranch = (await db.select().from(branches).orderBy(asc(branches.id)).limit(1))[0];
  if (!mainBranch) return;

  const existingWarehouses = await db.select().from(warehouses).where(eq(warehouses.branchId, mainBranch.id)).limit(1);
  if (!existingWarehouses[0]) {
    await db.insert(warehouses).values({ branchId: mainBranch.id, name: "المخزن الرئيسي", code: "MAIN-WH", isDefault: 1 });
  }
  const existingCash = await db.select().from(cashAccounts).where(eq(cashAccounts.branchId, mainBranch.id)).limit(1);
  if (!existingCash[0]) {
    await db.insert(cashAccounts).values({ branchId: mainBranch.id, name: "الخزنة الرئيسية", type: "cashbox", openingBalance: 0, currentBalance: 0 });
  }
  const existingSettings = await db.select().from(businessSettings).limit(1);
  if (!existingSettings[0]) {
    await db.insert(businessSettings).values({ businessName: "مؤسسة متجري للتجارة", address: "الفرع الرئيسي", vatEnabled: 1, vatRateBps: 1400, loyaltyEnabled: 0 });
  }
}

export async function listBranches() {
  await ensureOperationalDefaults();
  const db = await getDb();
  return db ? db.select().from(branches).orderBy(asc(branches.name)) : [];
}

export async function listWarehouses(branchId?: number) {
  await ensureOperationalDefaults();
  const db = await getDb();
  if (!db) return [];
  return branchId ? db.select().from(warehouses).where(eq(warehouses.branchId, branchId)).orderBy(asc(warehouses.name)) : db.select().from(warehouses).orderBy(asc(warehouses.name));
}

export async function getBusinessSettings() {
  await ensureOperationalDefaults();
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(businessSettings).limit(1))[0];
}

export async function createBranch(input: { name: string; code: string; color: string; address?: string; phone?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const result = await db.insert(branches).values({ ...input, isActive: 1 });
  const branchId = Number(result[0].insertId);
  await db.insert(warehouses).values({ branchId, name: `مخزن ${input.name}`, code: `${input.code}-WH`, isDefault: 1 });
  await db.insert(cashAccounts).values({ branchId, name: `خزنة ${input.name}`, type: "cashbox", openingBalance: 0, currentBalance: 0 });
  return { branchId };
}

export async function updateBusinessSettings(input: { businessName: string; address?: string; taxNumber?: string; vatEnabled: boolean; vatRateBps: number; receiptPromoText?: string; receiptPromoUrl?: string; receiptFormat: "58mm" | "80mm" | "a4"; theme: "light" | "dark" | "navy"; loyaltyEnabled: boolean }) {
  await ensureOperationalDefaults();
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const settings = (await db.select().from(businessSettings).limit(1))[0];
  if (!settings) throw new Error("تعذر تحميل الإعدادات");
  await db.update(businessSettings).set({ ...input, vatEnabled: input.vatEnabled ? 1 : 0, loyaltyEnabled: input.loyaltyEnabled ? 1 : 0 }).where(eq(businessSettings.id, settings.id));
}
