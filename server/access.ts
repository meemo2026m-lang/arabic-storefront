import { and, asc, count, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { erpPermissions, erpRolePermissions, erpRoles, erpUserPermissions, erpUserRoles, users } from "../drizzle/schema";
import { getDb } from "./db";

const roleDefinitions = [
  { name: "مدير النظام", code: "system_admin", description: "وصول كامل إلى إعدادات النظام والتقارير والمستخدمين.", isSystem: 1 },
  { name: "مدير المبيعات", code: "sales_manager", description: "إدارة المبيعات والفواتير والعملاء والمتابعة اليومية.", isSystem: 1 },
  { name: "كاشير", code: "cashier", description: "تنفيذ عمليات البيع ومراجعة الفواتير الخاصة به.", isSystem: 1 },
] as const;

const permissionDefinitions = [
  { code: "dashboard.view", module: "الرئيسية", label: "عرض لوحة التحكم" },
  { code: "sales.pos", module: "المبيعات", label: "استخدام شاشة البيع السريعة" },
  { code: "sales.invoices", module: "المبيعات", label: "عرض وإدارة الفواتير" },
  { code: "inventory.view", module: "المخزون", label: "عرض مراقبة المخزون" },
  { code: "inventory.adjust", module: "المخزون", label: "تسوية وتحويل المخزون" },
  { code: "products.manage", module: "المنتجات", label: "إضافة وتعديل المنتجات" },
  { code: "reports.view", module: "التقارير", label: "عرض التقارير المالية" },
  { code: "users.manage", module: "الإعدادات", label: "إدارة المستخدمين والصلاحيات" },
] as const;

async function ensureAccessDemo() {
  const db = await getDb();
  if (!db) return;
  const roleCount = await db.select({ value: count() }).from(erpRoles);
  if ((roleCount[0]?.value ?? 0) === 0) await db.insert(erpRoles).values([...roleDefinitions]);

  const permissionCount = await db.select({ value: count() }).from(erpPermissions);
  if ((permissionCount[0]?.value ?? 0) === 0) await db.insert(erpPermissions).values([...permissionDefinitions]);

  const demoUsers = [
    { openId: "erp-demo-admin", name: "مدير النظام", email: "admin@erp.local", loginMethod: "demo", role: "admin" as const },
    { openId: "erp-demo-sales", name: "محمد مرقوش", email: "sales@erp.local", loginMethod: "demo", role: "user" as const },
    { openId: "erp-demo-cashier", name: "مستخدم الكاشير", email: "cashier@erp.local", loginMethod: "demo", role: "user" as const },
  ];
  const existingUsers = await db.select({ openId: users.openId }).from(users).where(inArray(users.openId, demoUsers.map(user => user.openId)));
  const existingOpenIds = new Set(existingUsers.map(user => user.openId));
  const missingUsers = demoUsers.filter(user => !existingOpenIds.has(user.openId));
  if (missingUsers.length) await db.insert(users).values(missingUsers.map(user => ({ ...user, lastSignedIn: new Date() })));

  const roleRows = await db.select().from(erpRoles);
  const permissionRows = await db.select().from(erpPermissions);
  const assignmentCount = await db.select({ value: count() }).from(erpRolePermissions);
  if ((assignmentCount[0]?.value ?? 0) === 0) {
    const adminRole = roleRows.find(role => role.code === "system_admin");
    const salesRole = roleRows.find(role => role.code === "sales_manager");
    const cashierRole = roleRows.find(role => role.code === "cashier");
    if (adminRole && salesRole && cashierRole) {
      await db.insert(erpRolePermissions).values([
        ...permissionRows.map(permission => ({ roleId: adminRole.id, permissionId: permission.id })),
        ...permissionRows.filter(permission => !permission.code.startsWith("users.")).map(permission => ({ roleId: salesRole.id, permissionId: permission.id })),
        ...permissionRows.filter(permission => ["dashboard.view", "sales.pos", "sales.invoices"].includes(permission.code)).map(permission => ({ roleId: cashierRole.id, permissionId: permission.id })),
      ]);
    }
  }

  const relationCount = await db.select({ value: count() }).from(erpUserRoles);
  if ((relationCount[0]?.value ?? 0) === 0) {
    const storedUsers = await db.select().from(users).where(inArray(users.openId, demoUsers.map(user => user.openId)));
    const rolesByCode = new Map(roleRows.map(role => [role.code, role.id]));
    const userByOpenId = new Map(storedUsers.map(user => [user.openId, user.id]));
    await db.insert(erpUserRoles).values([
      { userId: userByOpenId.get("erp-demo-admin")!, roleId: rolesByCode.get("system_admin")! },
      { userId: userByOpenId.get("erp-demo-sales")!, roleId: rolesByCode.get("sales_manager")! },
      { userId: userByOpenId.get("erp-demo-cashier")!, roleId: rolesByCode.get("cashier")! },
    ]);
  }
}

export async function listAccessUsers() {
  await ensureAccessDemo();
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive, activeRoleId: erpRoles.id, activeRoleName: erpRoles.name, activeRoleCode: erpRoles.code })
    .from(users).leftJoin(erpUserRoles, eq(erpUserRoles.userId, users.id)).leftJoin(erpRoles, eq(erpRoles.id, erpUserRoles.roleId)).orderBy(asc(users.name));
}

export async function listAccessRoles() {
  await ensureAccessDemo();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(erpRoles).orderBy(asc(erpRoles.id));
}

export async function listAccessPermissions() {
  await ensureAccessDemo();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(erpPermissions).orderBy(asc(erpPermissions.module), asc(erpPermissions.id));
}

export async function setUserRole(userId: number, roleId: number) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.delete(erpUserRoles).where(eq(erpUserRoles.userId, userId));
  await db.insert(erpUserRoles).values({ userId, roleId });
}

export async function setUserPermission(userId: number, permissionId: number, isAllowed: boolean) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.delete(erpUserPermissions).where(and(eq(erpUserPermissions.userId, userId), eq(erpUserPermissions.permissionId, permissionId)));
  await db.insert(erpUserPermissions).values({ userId, permissionId, isAllowed: isAllowed ? 1 : 0 });
}

export async function createAccessUser(input: { name: string; email?: string; roleId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  const openId = `erp-managed-${nanoid(12)}`;
  const result = await db.insert(users).values({ openId, name: input.name, email: input.email || null, loginMethod: "erp", role: "user", lastSignedIn: new Date() });
  const userId = Number(result[0].insertId);
  await db.insert(erpUserRoles).values({ userId, roleId: input.roleId });
  return { userId };
}

export async function updateAccessUser(input: { userId: number; name: string; email?: string; isActive: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.update(users).set({ name: input.name, email: input.email || null, isActive: input.isActive ? 1 : 0 }).where(eq(users.id, input.userId));
}
