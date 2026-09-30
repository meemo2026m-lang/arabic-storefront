import { describe, expect, it } from "vitest";
import { pageForQuickAction, productManagementRows } from "./erp";

describe("ERP navigation and product rows", () => {
  it("routes reference quick actions to their matching ERP pages", () => {
    expect(pageForQuickAction("سجل وفواتير المبيعات")).toBe("invoices");
    expect(pageForQuickAction("جرد وإدارة المخزون")).toBe("inventory");
    expect(pageForQuickAction("دليل المنتجات والخدمات")).toBe("products");
  });

  it("maps every quick-action category to a visible ERP workspace", () => {
    expect(pageForQuickAction("سندات الصرف والمصروفات")).toBe("accounts");
    expect(pageForQuickAction("تحويلات المخزون")).toBe("transfers");
    expect(pageForQuickAction("قوائم وسياسات الأسعار")).toBe("pricing");
    expect(pageForQuickAction("نواقص وإعادة الطلب")).toBe("shortages");
  });

  it("renders database product records with deterministic management data", () => {
    const rows = productManagementRows([{ id: 7, name: "منتج اختبار", price: 24500, imageUrl: "/product.jpg", category: { name: "إكسسوارات" } }]);
    expect(rows[0]).toMatchObject({ sku: "PRD-1001", inventory: 13, isLowStock: false, name: "منتج اختبار" });
  });
});
