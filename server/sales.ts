import { and, asc, eq, inArray } from "drizzle-orm";
import { businessSettings, cashAccounts, customers, inventoryBalances, inventoryMovements, invoicePayments, productDetails, products, salesInvoiceItems, salesInvoices, salesReturnItems, salesReturns } from "../drizzle/schema";
import { getDb } from "./db";
import { ensureOperationalProducts } from "./commerce";

export type SaleInput = { branchId: number; warehouseId: number; customerId?: number; discountTotal: number; items: Array<{ productId: number; quantity: number }>; payments: Array<{ cashAccountId?: number; method: "cash" | "network" | "wallet" | "bank" | "credit"; amount: number }>; notes?: string };

export async function listCashAccounts(branchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cashAccounts).where(and(eq(cashAccounts.branchId, branchId), eq(cashAccounts.isActive, 1))).orderBy(asc(cashAccounts.name));
}

export async function issueSale(input: SaleInput, cashierUserId: number) {
  await ensureOperationalProducts();
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  if (!input.items.length) throw new Error("أضف صنفاً واحداً على الأقل إلى السلة");
  if (input.items.some(item => item.quantity <= 0)) throw new Error("كمية الصنف يجب أن تكون أكبر من صفر");
  return db.transaction(async tx => {
    const productIds = Array.from(new Set(input.items.map(item => item.productId)));
    const rows = await tx.select({ id: products.id, price: products.price, purchasePrice: productDetails.purchasePrice, quantity: inventoryBalances.quantity, balanceId: inventoryBalances.id }).from(products).innerJoin(productDetails, eq(productDetails.productId, products.id)).innerJoin(inventoryBalances, eq(inventoryBalances.productId, products.id)).where(and(inArray(products.id, productIds), eq(inventoryBalances.warehouseId, input.warehouseId)));
    if (rows.length !== productIds.length) throw new Error("أحد أصناف السلة غير متاح في المستودع الحالي");
    const productMap = new Map(rows.map(row => [row.id, row]));
    for (const item of input.items) { const product = productMap.get(item.productId); if (!product || product.quantity < item.quantity) throw new Error("لا توجد كمية كافية لإتمام البيع"); }
    const subtotal = input.items.reduce((sum, item) => sum + (productMap.get(item.productId)?.price ?? 0) * item.quantity, 0);
    const settings = (await tx.select().from(businessSettings).limit(1))[0];
    const discountTotal = Math.min(Math.max(0, input.discountTotal), subtotal);
    const vatTotal = settings?.vatEnabled ? Math.round((subtotal - discountTotal) * settings.vatRateBps / 10000) : 0;
    const grandTotal = subtotal - discountTotal + vatTotal;
    const amountPaid = input.payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (amountPaid > grandTotal) throw new Error("إجمالي الدفعات أكبر من إجمالي الفاتورة");
    const amountDue = grandTotal - amountPaid;
    if (amountDue > 0 && !input.customerId) throw new Error("اختر عميلاً لتسجيل الجزء الآجل من الفاتورة");
    if (amountDue > 0 && input.customerId) { const customer = (await tx.select().from(customers).where(eq(customers.id, input.customerId)).limit(1))[0]; if (!customer) throw new Error("العميل غير موجود"); if (customer.creditLimit > 0 && amountDue > customer.creditLimit) throw new Error("الجزء الآجل يتجاوز الحد الائتماني للعميل"); }
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const result = await tx.insert(salesInvoices).values({ branchId: input.branchId, warehouseId: input.warehouseId, customerId: input.customerId ?? null, cashierUserId, invoiceNumber, subtotal, discountTotal, vatTotal, grandTotal, amountPaid, amountDue, notes: input.notes ?? null, status: "issued" });
    const invoiceId = Number(result[0].insertId);
    for (const item of input.items) { const product = productMap.get(item.productId)!; const lineTotal = product.price * item.quantity; await tx.insert(salesInvoiceItems).values({ invoiceId, productId: item.productId, quantity: item.quantity, unitPrice: product.price, unitCost: product.purchasePrice, lineTotal }); await tx.update(inventoryBalances).set({ quantity: product.quantity - item.quantity }).where(eq(inventoryBalances.id, product.balanceId)); await tx.insert(inventoryMovements).values({ branchId: input.branchId, warehouseId: input.warehouseId, productId: item.productId, type: "sale", quantityDelta: -item.quantity, unitCost: product.purchasePrice, referenceType: "sales_invoice", referenceId: invoiceId, createdByUserId: cashierUserId }); }
    for (const payment of input.payments.filter(payment => payment.amount > 0)) { await tx.insert(invoicePayments).values({ invoiceId, cashAccountId: payment.cashAccountId ?? null, method: payment.method, amount: payment.amount }); if (payment.cashAccountId) { const account = (await tx.select().from(cashAccounts).where(eq(cashAccounts.id, payment.cashAccountId)).limit(1))[0]; if (account) await tx.update(cashAccounts).set({ currentBalance: account.currentBalance + payment.amount }).where(eq(cashAccounts.id, account.id)); } }
    return { invoiceId, invoiceNumber, grandTotal, amountDue };
  });
}

export async function listSalesInvoices(branchId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: salesInvoices.id, invoiceNumber: salesInvoices.invoiceNumber, issuedAt: salesInvoices.issuedAt, grandTotal: salesInvoices.grandTotal, amountPaid: salesInvoices.amountPaid, amountDue: salesInvoices.amountDue, status: salesInvoices.status, customerName: customers.name }).from(salesInvoices).leftJoin(customers, eq(customers.id, salesInvoices.customerId)).where(eq(salesInvoices.branchId, branchId)).orderBy(asc(salesInvoices.id));
}

export async function getSalesInvoiceDetails(invoiceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const invoice = (await db.select().from(salesInvoices).where(eq(salesInvoices.id, invoiceId)).limit(1))[0];
  if (!invoice) return undefined;
  const items = await db.select({ id: salesInvoiceItems.id, productId: salesInvoiceItems.productId, productName: products.name, quantity: salesInvoiceItems.quantity, unitPrice: salesInvoiceItems.unitPrice, lineTotal: salesInvoiceItems.lineTotal }).from(salesInvoiceItems).innerJoin(products, eq(products.id, salesInvoiceItems.productId)).where(eq(salesInvoiceItems.invoiceId, invoiceId));
  return { invoice, items };
}

export async function issueSalesReturn(input: { invoiceId: number; refundCashAccountId?: number; reason?: string; items: Array<{ invoiceItemId: number; quantity: number; reason?: string }> }, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  if (!input.items.length) throw new Error("اختر صنفاً واحداً على الأقل للمرتجع");
  return db.transaction(async tx => {
    const invoice = (await tx.select().from(salesInvoices).where(eq(salesInvoices.id, input.invoiceId)).limit(1))[0];
    if (!invoice) throw new Error("الفاتورة غير موجودة");
    const originalItems = await tx.select().from(salesInvoiceItems).where(eq(salesInvoiceItems.invoiceId, input.invoiceId));
    const originalMap = new Map(originalItems.map(item => [item.id, item]));
    const previousReturns = await tx.select({ invoiceItemId: salesReturnItems.invoiceItemId, quantity: salesReturnItems.quantity }).from(salesReturnItems).innerJoin(salesReturns, eq(salesReturns.id, salesReturnItems.returnId)).where(eq(salesReturns.invoiceId, input.invoiceId));
    const alreadyReturned = new Map<number, number>();
    previousReturns.forEach(item => alreadyReturned.set(item.invoiceItemId, (alreadyReturned.get(item.invoiceItemId) ?? 0) + item.quantity));
    let total = 0;
    for (const item of input.items) { const original = originalMap.get(item.invoiceItemId); if (!original || item.quantity <= 0) throw new Error("بيانات صنف المرتجع غير صالحة"); if ((alreadyReturned.get(item.invoiceItemId) ?? 0) + item.quantity > original.quantity) throw new Error("كمية المرتجع أكبر من الكمية المتاحة"); total += Math.round(original.lineTotal * item.quantity / original.quantity); }
    const returnNumber = `RET-${Date.now().toString().slice(-8)}`;
    const result = await tx.insert(salesReturns).values({ invoiceId: invoice.id, branchId: invoice.branchId, warehouseId: invoice.warehouseId, refundCashAccountId: input.refundCashAccountId ?? null, returnNumber, reason: input.reason ?? null, total, createdByUserId: userId });
    const returnId = Number(result[0].insertId);
    for (const item of input.items) { const original = originalMap.get(item.invoiceItemId)!; const lineTotal = Math.round(original.lineTotal * item.quantity / original.quantity); await tx.insert(salesReturnItems).values({ returnId, invoiceItemId: item.invoiceItemId, quantity: item.quantity, reason: item.reason ?? null, lineTotal }); const balance = (await tx.select().from(inventoryBalances).where(and(eq(inventoryBalances.productId, original.productId), eq(inventoryBalances.warehouseId, invoice.warehouseId))).limit(1))[0]; if (balance) await tx.update(inventoryBalances).set({ quantity: balance.quantity + item.quantity }).where(eq(inventoryBalances.id, balance.id)); await tx.insert(inventoryMovements).values({ branchId: invoice.branchId, warehouseId: invoice.warehouseId, productId: original.productId, type: "sale_return", quantityDelta: item.quantity, unitCost: original.unitCost, referenceType: "sales_return", referenceId: returnId, createdByUserId: userId }); }
    if (input.refundCashAccountId) { const account = (await tx.select().from(cashAccounts).where(eq(cashAccounts.id, input.refundCashAccountId)).limit(1))[0]; if (!account || account.currentBalance < total) throw new Error("رصيد الخزنة لا يكفي لتنفيذ المرتجع"); await tx.update(cashAccounts).set({ currentBalance: account.currentBalance - total }).where(eq(cashAccounts.id, account.id)); }
    await tx.update(salesInvoices).set({ status: "partially_returned" }).where(eq(salesInvoices.id, invoice.id));
    return { returnId, returnNumber, total };
  });
}
