export type ErpPageId = "dashboard" | "invoices" | "inventory" | "products" | "reports" | "quick" | "users" | "permissions" | "sales" | "purchases" | "customers" | "suppliers" | "accounts" | "treasury" | "settings" | "pos" | "returns" | "branches" | "pricing" | "transfers" | "shortages" | "network";

export type ErpProductRecord = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string };
};

export function pageForQuickAction(label: string): ErpPageId | undefined {
  if (label.includes("شاشة البيع") || label.includes("(POS)")) return "pos";
  if (label.includes("فواتير")) return "invoices";
  if (label.includes("مرتجع")) return "returns";
  if (label.includes("شراء")) return "purchases";
  if (label.includes("العملاء")) return "customers";
  if (label.includes("الموردين")) return "suppliers";
  if (label.includes("الصرف") || label.includes("المصروفات")) return "accounts";
  if (label.includes("الخزن") || label.includes("البنوك")) return "treasury";
  if (label.includes("المستودعات") || label.includes("الفروع")) return "branches";
  if (label.includes("الأسعار") || label.includes("العروض")) return "pricing";
  if (label.includes("نواقص")) return "shortages";
  if (label.includes("تحويلات")) return "transfers";
  if (label.includes("المخزون")) return "inventory";
  if (label.includes("الشبكة") || label.includes("الربط")) return "network";
  if (label.includes("المنتجات")) return "products";
  return undefined;
}

export function productManagementRows(products: ErpProductRecord[]) {
  return products.map((product, index) => ({
    ...product,
    sku: `PRD-${1001 + index}`,
    inventory: index % 3 === 1 ? 5 : 13 + index,
    minimumStock: 5 + index,
    isLowStock: index % 3 === 1,
  }));
}
