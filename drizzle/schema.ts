import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull().references(() => categories.id),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  compareAtPrice: int("compareAtPrice"),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  badge: varchar("badge", { length: 80 }),
  isFeatured: int("isFeatured").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const erpRoles = mysqlTable("erpRoles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 80 }).notNull().unique(),
  description: text("description"),
  isSystem: int("isSystem").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const erpPermissions = mysqlTable("erpPermissions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 120 }).notNull().unique(),
  module: varchar("module", { length: 80 }).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const erpRolePermissions = mysqlTable("erpRolePermissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull().references(() => erpRoles.id),
  permissionId: int("permissionId").notNull().references(() => erpPermissions.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const erpUserRoles = mysqlTable("erpUserRoles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  roleId: int("roleId").notNull().references(() => erpRoles.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const erpUserPermissions = mysqlTable("erpUserPermissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  permissionId: int("permissionId").notNull().references(() => erpPermissions.id),
  isAllowed: int("isAllowed").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const branches = mysqlTable("branches", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  color: varchar("color", { length: 24 }).default("#214696").notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  address: text("address"),
  phone: varchar("phone", { length: 40 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userBranches = mysqlTable("userBranches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  isDefault: int("isDefault").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  isDefault: int("isDefault").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const businessSettings = mysqlTable("businessSettings", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 180 }).notNull(),
  logoUrl: varchar("logoUrl", { length: 500 }),
  address: text("address"),
  taxNumber: varchar("taxNumber", { length: 80 }),
  vatEnabled: int("vatEnabled").default(0).notNull(),
  vatRateBps: int("vatRateBps").default(1400).notNull(),
  defaultInvoicePayment: mysqlEnum("defaultInvoicePayment", ["cash", "credit"]).default("cash").notNull(),
  invoiceHeader: text("invoiceHeader"),
  invoiceFooter: text("invoiceFooter"),
  returnTerms: text("returnTerms"),
  receiptPromoText: varchar("receiptPromoText", { length: 300 }),
  receiptPromoUrl: varchar("receiptPromoUrl", { length: 500 }),
  receiptFormat: mysqlEnum("receiptFormat", ["58mm", "80mm", "a4"]).default("80mm").notNull(),
  theme: mysqlEnum("theme", ["light", "dark", "navy"]).default("navy").notNull(),
  fontFamily: varchar("fontFamily", { length: 80 }).default("Cairo").notNull(),
  loyaltyEnabled: int("loyaltyEnabled").default(0).notNull(),
  loyaltyPointValueCents: int("loyaltyPointValueCents").default(5).notNull(),
  loyaltyMinimumPoints: int("loyaltyMinimumPoints").default(100).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const productDetails = mysqlTable("productDetails", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().unique().references(() => products.id),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  barcode: varchar("barcode", { length: 96 }).unique(),
  unit: varchar("unit", { length: 40 }).default("قطعة").notNull(),
  purchasePrice: int("purchasePrice").default(0).notNull(),
  wholesalePrice: int("wholesalePrice"),
  commissionType: mysqlEnum("commissionType", ["none", "fixed", "percent"]).default("none").notNull(),
  commissionValue: int("commissionValue").default(0).notNull(),
  minimumStock: int("minimumStock").default(0).notNull(),
  expiryDate: timestamp("expiryDate"),
  productionDate: timestamp("productionDate"),
  receiptDescription: varchar("receiptDescription", { length: 300 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inventoryBalances = mysqlTable("inventoryBalances", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id),
  quantity: int("quantity").default(0).notNull(),
  averageCost: int("averageCost").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inventoryMovements = mysqlTable("inventoryMovements", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id),
  productId: int("productId").notNull().references(() => products.id),
  type: mysqlEnum("type", ["opening", "purchase", "sale", "sale_return", "purchase_return", "transfer_out", "transfer_in", "adjustment", "damage"]).notNull(),
  quantityDelta: int("quantityDelta").notNull(),
  unitCost: int("unitCost").default(0).notNull(),
  referenceType: varchar("referenceType", { length: 48 }),
  referenceId: int("referenceId"),
  notes: text("notes"),
  createdByUserId: int("createdByUserId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  type: mysqlEnum("type", ["individual", "company", "institution"]).default("individual").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  taxNumber: varchar("taxNumber", { length: 80 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  openingBalance: int("openingBalance").default(0).notNull(),
  creditLimit: int("creditLimit").default(0).notNull(),
  notes: text("notes"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 180 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  taxNumber: varchar("taxNumber", { length: 80 }),
  contactName: varchar("contactName", { length: 160 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  openingBalance: int("openingBalance").default(0).notNull(),
  creditLimit: int("creditLimit").default(0).notNull(),
  paymentTerms: varchar("paymentTerms", { length: 180 }),
  notes: text("notes"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cashAccounts = mysqlTable("cashAccounts", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  name: varchar("name", { length: 160 }).notNull(),
  type: mysqlEnum("type", ["cashbox", "bank", "wallet", "network"]).notNull(),
  openingBalance: int("openingBalance").default(0).notNull(),
  currentBalance: int("currentBalance").default(0).notNull(),
  details: text("details"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const cashierShifts = mysqlTable("cashierShifts", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  userId: int("userId").notNull().references(() => users.id),
  cashAccountId: int("cashAccountId").notNull().references(() => cashAccounts.id),
  openingCash: int("openingCash").default(0).notNull(),
  closingCash: int("closingCash"),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export const salesInvoices = mysqlTable("salesInvoices", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id),
  customerId: int("customerId").references(() => customers.id),
  cashierUserId: int("cashierUserId").notNull().references(() => users.id),
  shiftId: int("shiftId").references(() => cashierShifts.id),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "issued", "voided", "partially_returned", "returned"]).default("issued").notNull(),
  subtotal: int("subtotal").default(0).notNull(),
  discountTotal: int("discountTotal").default(0).notNull(),
  vatTotal: int("vatTotal").default(0).notNull(),
  grandTotal: int("grandTotal").default(0).notNull(),
  amountPaid: int("amountPaid").default(0).notNull(),
  amountDue: int("amountDue").default(0).notNull(),
  notes: text("notes"),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});

export const salesInvoiceItems = mysqlTable("salesInvoiceItems", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull().references(() => salesInvoices.id),
  productId: int("productId").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  unitCost: int("unitCost").default(0).notNull(),
  discountTotal: int("discountTotal").default(0).notNull(),
  vatTotal: int("vatTotal").default(0).notNull(),
  lineTotal: int("lineTotal").notNull(),
});

export const invoicePayments = mysqlTable("invoicePayments", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull().references(() => salesInvoices.id),
  cashAccountId: int("cashAccountId").references(() => cashAccounts.id),
  method: mysqlEnum("method", ["cash", "network", "wallet", "bank", "credit"]).notNull(),
  amount: int("amount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const salesReturns = mysqlTable("salesReturns", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull().references(() => salesInvoices.id),
  branchId: int("branchId").notNull().references(() => branches.id),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id),
  refundCashAccountId: int("refundCashAccountId").references(() => cashAccounts.id),
  returnNumber: varchar("returnNumber", { length: 80 }).notNull().unique(),
  reason: varchar("reason", { length: 240 }),
  total: int("total").default(0).notNull(),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const salesReturnItems = mysqlTable("salesReturnItems", {
  id: int("id").autoincrement().primaryKey(),
  returnId: int("returnId").notNull().references(() => salesReturns.id),
  invoiceItemId: int("invoiceItemId").notNull().references(() => salesInvoiceItems.id),
  quantity: int("quantity").notNull(),
  reason: varchar("reason", { length: 160 }),
  lineTotal: int("lineTotal").notNull(),
});

export const purchaseInvoices = mysqlTable("purchaseInvoices", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  warehouseId: int("warehouseId").notNull().references(() => warehouses.id),
  supplierId: int("supplierId").notNull().references(() => suppliers.id),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  invoiceNumber: varchar("invoiceNumber", { length: 80 }).notNull().unique(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank", "wallet", "credit"]).default("credit").notNull(),
  cashAccountId: int("cashAccountId").references(() => cashAccounts.id),
  subtotal: int("subtotal").default(0).notNull(),
  discountTotal: int("discountTotal").default(0).notNull(),
  vatTotal: int("vatTotal").default(0).notNull(),
  freightTotal: int("freightTotal").default(0).notNull(),
  grandTotal: int("grandTotal").default(0).notNull(),
  amountPaid: int("amountPaid").default(0).notNull(),
  amountDue: int("amountDue").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const purchaseInvoiceItems = mysqlTable("purchaseInvoiceItems", {
  id: int("id").autoincrement().primaryKey(),
  purchaseInvoiceId: int("purchaseInvoiceId").notNull().references(() => purchaseInvoices.id),
  productId: int("productId").notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  unitCost: int("unitCost").notNull(),
  lineTotal: int("lineTotal").notNull(),
});

export const cashTransfers = mysqlTable("cashTransfers", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  fromCashAccountId: int("fromCashAccountId").notNull().references(() => cashAccounts.id),
  toCashAccountId: int("toCashAccountId").notNull().references(() => cashAccounts.id),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 300 }),
  createdByUserId: int("createdByUserId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  userId: int("userId").references(() => users.id),
  name: varchar("name", { length: 180 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  nationalId: varchar("nationalId", { length: 80 }),
  baseSalary: int("baseSalary").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const employeeAdjustments = mysqlTable("employeeAdjustments", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  type: mysqlEnum("type", ["bonus", "deduction"]).notNull(),
  amount: int("amount").notNull(),
  reason: varchar("reason", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const attendanceRecords = mysqlTable("attendanceRecords", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  checkInAt: timestamp("checkInAt"),
  checkOutAt: timestamp("checkOutAt"),
  notes: varchar("notes", { length: 300 }),
});

export const installmentPlans = mysqlTable("installmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  branchId: int("branchId").notNull().references(() => branches.id),
  customerId: int("customerId").notNull().references(() => customers.id),
  invoiceId: int("invoiceId").references(() => salesInvoices.id),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["active", "settled", "overdue", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const installmentPayments = mysqlTable("installmentPayments", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull().references(() => installmentPlans.id),
  dueAt: timestamp("dueAt").notNull(),
  amount: int("amount").notNull(),
  paidAmount: int("paidAmount").default(0).notNull(),
  paidAt: timestamp("paidAt"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
});

export const loyaltyTransactions = mysqlTable("loyaltyTransactions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => customers.id),
  invoiceId: int("invoiceId").references(() => salesInvoices.id),
  type: mysqlEnum("type", ["earn", "redeem", "adjustment"]).notNull(),
  points: int("points").notNull(),
  notes: varchar("notes", { length: 300 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ErpRole = typeof erpRoles.$inferSelect;
export type ErpPermission = typeof erpPermissions.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type SalesInvoice = typeof salesInvoices.$inferSelect;
