import { and, asc, eq } from "drizzle-orm";
import { categories, customers, inventoryBalances, inventoryMovements, productDetails, products, suppliers, warehouses } from "../drizzle/schema";
import { listCategories } from "./catalog";
import { getDb } from "./db";
import { ensureOperationalDefaults, listBranches, listWarehouses } from "./organization";

export async function ensureOperationalProducts() {
  await ensureOperationalDefaults();
  await listCategories();
  const db = await getDb();
  if (!db) return;
  const [branch] = await listBranches();
  const [warehouse] = await listWarehouses(branch?.id);
  if (!warehouse) return;
  const allProducts = await db.select().from(products);
  const details = await db.select().from(productDetails);
  const knownDetailIds = new Set(details.map(item => item.productId));
  for (const product of allProducts.filter(item => !knownDetailIds.has(item.id))) {
    await db.insert(productDetails).values({ productId: product.id, sku: `SKU-${product.id.toString().padStart(4, "0")}`, barcode: `ERP${product.id.toString().padStart(8, "0")}`, purchasePrice: Math.round(product.price * 0.65), wholesalePrice: Math.round(product.price * 0.9), minimumStock: 5 });
    await db.insert(inventoryBalances).values({ productId: product.id, warehouseId: warehouse.id, quantity: 20, averageCost: Math.round(product.price * 0.65) });
  }
}

export async function listInventory(branchId?: number) {
  await ensureOperationalProducts();
  const db = await getDb();
  if (!db) return [];
  const query = db.select({ id: products.id, name: products.name, price: products.price, imageUrl: products.imageUrl, categoryName: categories.name, sku: productDetails.sku, barcode: productDetails.barcode, unit: productDetails.unit, purchasePrice: productDetails.purchasePrice, wholesalePrice: productDetails.wholesalePrice, minimumStock: productDetails.minimumStock, expiryDate: productDetails.expiryDate, quantity: inventoryBalances.quantity, warehouseId: warehouses.id, warehouseName: warehouses.name, branchId: warehouses.branchId }).from(products).innerJoin(categories, eq(products.categoryId, categories.id)).innerJoin(productDetails, eq(productDetails.productId, products.id)).innerJoin(inventoryBalances, eq(inventoryBalances.productId, products.id)).innerJoin(warehouses, eq(warehouses.id, inventoryBalances.warehouseId));
  return branchId ? query.where(eq(warehouses.branchId, branchId)).orderBy(asc(products.name)) : query.orderBy(asc(products.name));
}

export async function createOperationalProduct(input: { categoryId: number; branchId: number; warehouseId: number; name: string; description?: string; price: number; purchasePrice: number; wholesalePrice?: number; sku: string; barcode?: string; unit: string; minimumStock: number; openingQuantity: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  return db.transaction(async tx => {
    const result = await tx.insert(products).values({ categoryId: input.categoryId, name: input.name, description: input.description ?? "", price: input.price, imageUrl: "", isFeatured: 0, sortOrder: 999 });
    const productId = Number(result[0].insertId);
    await tx.insert(productDetails).values({ productId, sku: input.sku, barcode: input.barcode || null, unit: input.unit, purchasePrice: input.purchasePrice, wholesalePrice: input.wholesalePrice ?? null, minimumStock: input.minimumStock });
    await tx.insert(inventoryBalances).values({ productId, warehouseId: input.warehouseId, quantity: input.openingQuantity, averageCost: input.purchasePrice });
    await tx.insert(inventoryMovements).values({ branchId: input.branchId, warehouseId: input.warehouseId, productId, type: "opening", quantityDelta: input.openingQuantity, unitCost: input.purchasePrice, referenceType: "product_opening" });
    return { productId };
  });
}

export async function listCustomers(branchId?: number) {
  await ensureOperationalDefaults();
  const db = await getDb();
  if (!db) return [];
  return branchId ? db.select().from(customers).where(eq(customers.branchId, branchId)).orderBy(asc(customers.name)) : db.select().from(customers).orderBy(asc(customers.name));
}

export async function createCustomer(input: { branchId: number; type: "individual" | "company" | "institution"; name: string; phone?: string; email?: string; taxNumber?: string; address?: string; city?: string; openingBalance: number; creditLimit: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const result = await db.insert(customers).values(input);
  return { customerId: Number(result[0].insertId) };
}

export async function listSuppliers(branchId?: number) {
  await ensureOperationalDefaults();
  const db = await getDb();
  if (!db) return [];
  return branchId ? db.select().from(suppliers).where(eq(suppliers.branchId, branchId)).orderBy(asc(suppliers.name)) : db.select().from(suppliers).orderBy(asc(suppliers.name));
}

export async function createSupplier(input: { branchId: number; name: string; phone?: string; email?: string; taxNumber?: string; contactName?: string; address?: string; city?: string; openingBalance: number; creditLimit: number; paymentTerms?: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const result = await db.insert(suppliers).values(input);
  return { supplierId: Number(result[0].insertId) };
}
