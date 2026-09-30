import { type ErpPageId, type ErpProductRecord } from "@/lib/erp";
import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const titles: Partial<Record<ErpPageId, string>> = {
  sales: "إدارة المبيعات",
  purchases: "المشتريات وفواتير الموردين",
  customers: "إدارة العملاء",
  suppliers: "إدارة الموردين",
  accounts: "الحسابات ودليل الحسابات",
  treasury: "مركز الخزن والبنوك",
  settings: "إعدادات النظام",
  pos: "شاشة البيع السريعة",
  returns: "مرتجع المبيعات",
  branches: "المستودعات والفروع",
  pricing: "سياسات الأسعار والعروض",
  transfers: "تحويلات المخزون",
  shortages: "نواقص وإعادة الطلب",
};

const descriptions: Partial<Record<ErpPageId, string>> = {
  sales: "متابعة حركة البيع وعرض أسرع الإجراءات المرتبطة بالفواتير.",
  purchases: "إنشاء وتسجيل فواتير الموردين ومتابعة أوامر الشراء.",
  customers: "البحث في بيانات العملاء ومتابعة الأرصدة والحركات.",
  suppliers: "إدارة الموردين والمشتريات والاستحقاقات.",
  accounts: "دليل الحسابات والقيود والحركة المالية.",
  treasury: "إدارة الخزن والبنوك والرصيد المتاح.",
  settings: "إعدادات العمل والمستخدمين والصلاحيات.",
  pos: "أضف المنتجات إلى فاتورة البيع السريعة ثم راجع الإجمالي.",
  returns: "تسجيل المرتجعات ومراجعة الفواتير ذات الصلة.",
  branches: "عرض الفروع والمستودعات والأرصدة المتاحة.",
  pricing: "إدارة تسعير المنتجات والعروض الترويجية.",
  transfers: "تحويل أصناف بين الفروع والمستودعات.",
  shortages: "الأصناف التي وصلت إلى حد الطلب الأدنى.",
};

export function ModuleWorkspace({ page, onNavigate, products }: { page: ErpPageId; onNavigate: (page: ErpPageId) => void; products: ErpProductRecord[] }) {
  const action = page === "settings" ? () => onNavigate("users") : page === "pos" ? () => toast.success("تم فتح فاتورة بيع جديدة في وضع العرض") : page === "sales" ? () => onNavigate("invoices") : page === "shortages" || page === "transfers" ? () => onNavigate("inventory") : () => toast.info("تم فتح إجراء الوحدة في وضع العرض");
  return <section className="module-workspace erp-panel"><div className="module-workspace__intro"><span className="module-workspace__icon"><LayoutDashboard size={28} /></span><div><h2>{titles[page]}</h2><p>{descriptions[page]}</p></div><button type="button" className="erp-button erp-button--green" onClick={action}>{page === "settings" ? "إدارة المستخدمين" : page === "sales" ? "عرض الفواتير" : "إجراء جديد"}</button></div><div className="module-metrics"><div><strong>{products.length}</strong><span>سجلات مرتبطة</span></div><div><strong>نشط</strong><span>حالة الوحدة</span></div><div><strong>اليوم</strong><span>آخر تحديث</span></div></div><div className="module-actions"><button type="button" onClick={() => onNavigate("quick")}>فتح الاختصارات السريعة</button><button type="button" onClick={() => onNavigate("users")}>المستخدمون والصلاحيات</button><button type="button" onClick={() => onNavigate("dashboard")}>العودة للرئيسية</button></div></section>;
}
