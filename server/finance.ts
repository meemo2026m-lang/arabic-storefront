import { and, eq } from "drizzle-orm";
import { cashAccounts, cashTransfers, inventoryBalances, purchaseInvoices, salesInvoices } from "../drizzle/schema";
import { getDb } from "./db";

export async function transferCash(input: { branchId: number; fromCashAccountId: number; toCashAccountId: number; amount: number; reason?: string }, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  if (input.fromCashAccountId === input.toCashAccountId) throw new Error("اختر خزنتين مختلفتين للتحويل");
  return db.transaction(async tx => { const from = (await tx.select().from(cashAccounts).where(eq(cashAccounts.id, input.fromCashAccountId)).limit(1))[0]; const to = (await tx.select().from(cashAccounts).where(eq(cashAccounts.id, input.toCashAccountId)).limit(1))[0]; if (!from || !to || from.branchId !== input.branchId || to.branchId !== input.branchId) throw new Error("حساب التحويل غير صالح"); if (from.currentBalance < input.amount) throw new Error("رصيد الحساب المصدر لا يكفي للتحويل"); await tx.update(cashAccounts).set({ currentBalance: from.currentBalance - input.amount }).where(eq(cashAccounts.id, from.id)); await tx.update(cashAccounts).set({ currentBalance: to.currentBalance + input.amount }).where(eq(cashAccounts.id, to.id)); const result = await tx.insert(cashTransfers).values({ ...input, createdByUserId: userId }); return { transferId: Number(result[0].insertId) }; });
}

export async function getBranchReport(branchId: number) {
  const db = await getDb();
  if (!db) return { sales: 0, purchases: 0, invoices: 0, purchaseInvoices: 0, outstanding: 0, cashBalance: 0, inventoryUnits: 0 };
  const sales = await db.select().from(salesInvoices).where(eq(salesInvoices.branchId, branchId));
  const purchases = await db.select().from(purchaseInvoices).where(eq(purchaseInvoices.branchId, branchId));
  const accounts = await db.select().from(cashAccounts).where(eq(cashAccounts.branchId, branchId));
  const balances = await db.select({ quantity: inventoryBalances.quantity }).from(inventoryBalances);
  return { sales: sales.reduce((sum, item) => sum + item.grandTotal, 0), purchases: purchases.reduce((sum, item) => sum + item.grandTotal, 0), invoices: sales.length, purchaseInvoices: purchases.length, outstanding: sales.reduce((sum, item) => sum + item.amountDue, 0), cashBalance: accounts.reduce((sum, item) => sum + item.currentBalance, 0), inventoryUnits: balances.reduce((sum, item) => sum + item.quantity, 0) };
}
