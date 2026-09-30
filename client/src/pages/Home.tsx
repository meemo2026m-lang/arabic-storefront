import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { pageForQuickAction, productManagementRows, type ErpPageId, type ErpProductRecord } from "@/lib/erp";
import { QuickShortcuts, UsersAndPermissions } from "./ErpAccessPanels";
import { ErpLogin } from "./ErpLogin";
import { OrganizationManager } from "./OrganizationManager";
import { OperationalDirectory } from "./OperationalDirectory";
import { PosPage } from "./PosPage";
import { ReturnsPage } from "./ReturnsPage";
import { FinancePanel } from "./FinancePanel";
import { NetworkPanel } from "./NetworkPanel";
import { ModuleWorkspace } from "@/components/ModuleWorkspace";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  FileText,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  Menu,
  Network,
  PackagePlus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const moduleTabs = [
  ["المبيعات", ShoppingCart], ["الفواتير", ReceiptText], ["المشتريات", ShoppingBag], ["المخزون", Boxes], ["العملاء", Users], ["الموردين", Truck], ["الحسابات", Landmark], ["التقارير", FileBarChart], ["الخزن والبنوك", Archive], ["الإعدادات", Settings], ["تحديث", RefreshCw],
] as const;

const quickActions = [
  ["شاشة البيع السريعة", "F1", ShoppingCart, "#f5bb19"],
  ["فاتورة بيع (POS)", "", ReceiptText, "#1469ef"],
  ["سجل وفواتير المبيعات", "", ClipboardList, "#5637e7"],
  ["مرتجع مبيعات", "", RefreshCw, "#078e84"],
  ["فاتورة شراء جديدة", "", PackagePlus, "#079b5c"],
  ["إدارة العملاء", "", Users, "#5a39e3"],
  ["دليل المنتجات والخدمات", "", Store, "#fb580a"],
  ["إدارة الموردين", "", Truck, "#bd12dc"],
  ["جرد وإدارة المخزون", "", Boxes, "#1766de"],
  ["المستودعات والفروع", "", Warehouse, "#087064"],
  ["مركز الخزن والبنوك", "", Landmark, "#5738df"],
  ["سندات الصرف والمصروفات", "", HandCoins, "#d48700"],
  ["تحويلات المخزون", "", RefreshCw, "#148ec4"],
  ["نواقص وإعادة الطلب", "", ClipboardList, "#d60d17"],
  ["قوائم وسياسات الأسعار", "", BookOpen, "#0e934c"],
  ["الشبكة والربط المحلي", "", Network, "#165e9f"],
] as const;

const invoiceRows = [
  ["INV-1026", "2026-08-18", "عميل نقدي", "نقدي", "3", "7,945.80", "محمد مرقوش"],
  ["INV-1025", "2026-08-18", "عميل نقدي", "نقدي", "2", "2,181.80", "محمد مرقوش"],
  ["INV-1024", "2026-08-18", "عميل نقدي", "نقدي", "4", "8,196.20", "محمد مرقوش"],
  ["INV-1023", "2026-08-18", "عميل نقدي", "نقدي", "3", "5,779.80", "محمد مرقوش"],
  ["INV-1022", "2026-08-18", "عميل نقدي", "نقدي", "4", "9,945.80", "محمد مرقوش"],
  ["INV-1021", "2026-08-18", "عميل نقدي", "نقدي", "2", "2,622.20", "محمد مرقوش"],
  ["INV-1020", "2026-08-18", "عميل نقدي", "نقدي", "3", "8,196.20", "محمد مرقوش"],
];

const pageTitles: Record<ErpPageId, string> = {
  dashboard: "لوحة التحكم الرئيسية",
  invoices: "سجل فواتير المبيعات والأرشيف",
  inventory: "مراقبة المخزون والأصناف",
  products: "دليل المنتجات والخدمات",
  reports: "التقارير والتحليلات",
  quick: "الاختصارات السريعة",
  users: "المستخدمين والصلاحيات",
  permissions: "إدارة الصلاحيات",
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
  network: "الشبكة والربط المحلي",
};

const moduleDestinations: Record<string, ErpPageId> = {
  "المبيعات": "sales",
  "الفواتير": "invoices",
  "المشتريات": "purchases",
  "المخزون": "inventory",
  "العملاء": "customers",
  "الموردين": "suppliers",
  "الحسابات": "accounts",
  "التقارير": "reports",
  "الخزن والبنوك": "treasury",
  "الإعدادات": "settings",
  "تحديث": "dashboard",
};

function formatMoney(value: string | number) {
  return `${value} ج.م`;
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [page, setPage] = useState<ErpPageId>(() => {
    if (typeof window === "undefined") return "dashboard";
    const requestedPage = new URLSearchParams(window.location.search).get("page") as ErpPageId | null;
    return requestedPage && pageTitles[requestedPage] ? requestedPage : "dashboard";
  });
  const [search, setSearch] = useState("");
  const [railSearch, setRailSearch] = useState("");
  const [activeBranchId, setActiveBranchId] = useState<number | null>(null);
  trpc.network.heartbeat.useQuery({ page }, { refetchInterval: 20_000, retry: false });
  const productsQuery = trpc.catalog.products.useQuery({ search });
  const branchesQuery = trpc.organization.branches.useQuery();
  const products = productsQuery.data ?? [];
  const branches = branchesQuery.data ?? [];
  const activeBranch = branches.find(branch => branch.id === activeBranchId) ?? branches[0];
  const navigate = (nextPage: ErpPageId) => {
    setPage(nextPage);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", nextPage);
      window.history.replaceState({}, "", url);
    }
  };

  if (authLoading) return <main className="erp-loading">جارٍ التحقق من حساب النظام...</main>;
  if (!isAuthenticated) return <ErpLogin />;

  return (
    <div className="erp-app">
      <header className="erp-systembar">
        <div className="erp-systembar__right"><Store size={13} /><strong>مؤسسة متجري للتجارة - {activeBranch?.name ?? "جارٍ تحميل الفروع"}</strong></div>
        <strong className="erp-systembar__title">نظام ERP الشامل للمبيعات والمخزون والمالية</strong>
        <div className="erp-systembar__left"><label className="branch-switcher"><select value={activeBranch?.id ?? ""} onChange={event => setActiveBranchId(Number(event.target.value))}>{branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select><ChevronDown size={12} /></label><span>{user?.name ?? "مستخدم النظام"}</span><button aria-label="التنبيهات" onClick={() => toast.info("لا توجد تنبيهات جديدة")}><Bell size={14} /></button><button className="logout-button" onClick={() => void logout()}>خروج</button></div>
      </header>

      <div className="erp-utilitybar"><span>الرئيسية <House size={12} /></span><span>ملف</span><span>تحرير</span><span>حركات</span><span>أدوات</span><span>تعليمات</span></div>
      <nav className="erp-modulebar" aria-label="أقسام النظام">
        {moduleTabs.map(([label, Icon]) => <button key={label} className={moduleDestinations[label] === page ? "module-tab module-tab--active" : "module-tab"} onClick={() => navigate(moduleDestinations[label])}><Icon size={14} />{label}</button>)}
        <button className="module-tab" type="button" onClick={() => navigate("quick")} aria-label="فتح الاختصارات"><Menu size={15} /></button>
      </nav>

      <div className="erp-workspace">
        <aside className="erp-quickrail">
          <button className="quickrail__title" type="button" onClick={() => navigate("quick")}><span>اختصارات سريعة</span><span>⚡</span></button>
          <label className="quickrail__search"><Search size={13} /><input value={railSearch} onChange={event => setRailSearch(event.target.value)} placeholder="ابحث عن اختصار..." /></label>
          <div className="quickrail__list">
            {quickActions.filter(([label]) => label.includes(railSearch)).map(([label, key, Icon, color]) => <ErpQuickActionButton key={label} label={label} onNavigate={navigate} className="quick-action" style={{ backgroundColor: color }}><span className="quick-action__key">{key}</span><span>{label}</span><Icon size={17} /></ErpQuickActionButton>)}
          </div>
        </aside>

        <main className="erp-main">
          <div className="erp-titlebar"><div className="page-title"><span className="page-title__icon"><LayoutDashboard size={20} /></span><ErpPageHeading page={page} /></div>{page === "products" && <button className="erp-button erp-button--green"><PackagePlus size={15} /> منتج جديد</button>}</div>
          {page === "dashboard" && <Dashboard onNavigate={navigate} />}
          {page === "invoices" && <Invoices search={search} onSearchChange={setSearch} branchId={activeBranch?.id} onNavigate={navigate} />}
          {page === "inventory" && <OperationalDirectory type="inventory" branchId={activeBranch?.id} />}
          {page === "products" && <Products products={products} loading={productsQuery.isLoading} search={search} onSearchChange={setSearch} branchId={activeBranch?.id} />}
          {page === "reports" && <FinancePanel branchId={activeBranch?.id} mode="reports" />}
          {page === "quick" && <QuickShortcuts onNavigate={navigate} />}
          {(page === "users" || page === "permissions") && <UsersAndPermissions initialView={page} />}
          {page === "branches" && <OrganizationManager view="branches" />}
          {page === "settings" && <OrganizationManager view="settings" />}
          {page === "customers" && <OperationalDirectory type="customers" branchId={activeBranch?.id} />}
          {page === "suppliers" && <OperationalDirectory type="suppliers" branchId={activeBranch?.id} />}
          {page === "pos" && <PosPage branchId={activeBranch?.id} />}
          {page === "returns" && <ReturnsPage branchId={activeBranch?.id} />}
          {page === "treasury" && <FinancePanel branchId={activeBranch?.id} mode="treasury" />}
          {page === "accounts" && <FinancePanel branchId={activeBranch?.id} mode="accounts" />}
          {page === "network" && <NetworkPanel />}
          {(["sales", "purchases", "pricing", "transfers", "shortages"] as ErpPageId[]).includes(page) && <ModuleWorkspace page={page} onNavigate={navigate} products={products} />}
        </main>
      </div>
      <footer className="erp-statusbar"><span>{new Date().toLocaleDateString("ar-EG")}</span><span>المستخدم: {user?.name ?? "مستخدم النظام"}</span><span>الفرع: {activeBranch?.name ?? "—"}</span><span className="statusbar__online">متصل والتحديث مفعل</span><strong>حقوق الملكية والتطوير: متجري ERP</strong></footer>
    </div>
  );
}

export function ErpPageHeading({ page }: { page: ErpPageId }) {
  return <div><h1>{pageTitles[page]}</h1><p>متابعة عمليات المبيعات والمخزون بشكل منظم ومباشر</p></div>;
}

export function ErpQuickActionButton({ label, onNavigate, children, ...props }: { label: string; onNavigate: (page: ErpPageId) => void; children?: React.ReactNode } & Omit<React.ComponentProps<"button">, "onClick" | "children">) {
  return <button {...props} type="button" onClick={() => { const target = pageForQuickAction(label); if (target) onNavigate(target); }}>{children ?? label}</button>;
}

export function ErpNavigationTestbed() {
  const [page, setPage] = useState<ErpPageId>("dashboard");
  return <section><ErpPageHeading page={page} /><ErpQuickActionButton label="دليل المنتجات والخدمات" onNavigate={setPage}>دليل المنتجات والخدمات</ErpQuickActionButton></section>;
}

function Dashboard({ onNavigate }: { onNavigate: (page: ErpPageId) => void }) {
  const [period, setPeriod] = useState("هذا الشهر");
  const figures: Record<string, string> = { "اليوم": "8,196.20", "آخر 7 أيام": "52,780.80", "هذا الشهر": "153,450.00", "هذه السنة": "1,245,450.00" };
  const salesValue = figures[period] ?? figures["هذا الشهر"];
  return <>
    <div className="dashboard-filterbar"><span>فترة عرض المؤشرات: <strong>{period}</strong></span><div>{["اليوم", "آخر 7 أيام", "هذا الشهر", "هذه السنة"].map(item => <button type="button" key={item} className={period === item ? "filter-pill filter-pill--active" : "filter-pill"} onClick={() => setPeriod(item)}>{item}</button>)}</div></div>
    <section className="kpi-grid">
      <Kpi icon={<ShoppingCart />} color="blue" title="إجمالي المبيعات" value={salesValue} note={`ملخص ${period}`} />
      <Kpi icon={<FileText />} color="indigo" title="عدد الفواتير" value={period === "اليوم" ? "4" : period === "آخر 7 أيام" ? "12" : "23"} note="فاتورة مسجلة بالنظام" />
      <Kpi icon={<Landmark />} color="mint" title="إجمالي الإيرادات" value={salesValue} note="المدفوعات النقدية الداخلة" />
      <Kpi icon={<CircleDollarSign />} color="rose" title="تنبيهات المخزون" value="4 صنف" note="تحتاج إلى إعادة الطلب" />
    </section>
    <section className="dashboard-grid">
      <div className="dashboard-primary erp-panel">
        <PanelTitle title="الفواتير الأخيرة" icon={<FileText size={16} />} action="عرض كل الفواتير" onAction={() => onNavigate("invoices")} />
        <table className="erp-table invoice-table"><thead><tr><th>التاريخ</th><th>رقم الفاتورة</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>معاينة</th></tr></thead><tbody>{invoiceRows.map(row => <tr key={row[0]}><td>{row[1]}</td><td className="mono">{row[0]}</td><td>{row[2]}</td><td className="amount">{formatMoney(row[5])}</td><td><span className="status-chip status-chip--paid">مدفوعة</span></td><td><button className="table-detail" onClick={() => onNavigate("invoices")}>تفاصيل</button></td></tr>)}</tbody></table>
      </div>
      <div className="dashboard-side">
        <div className="erp-panel chart-card"><PanelTitle title="معدل المبيعات اليومي" icon={<BarChart3 size={16} />} /><div className="bar-chart"><span style={{ height: "10%" }} /><span style={{ height: "16%" }} /><span style={{ height: "11%" }} /><span style={{ height: "23%" }} /><span style={{ height: "82%" }} /><b>اليوم</b></div></div>
        <div className="erp-panel donut-card"><PanelTitle title="أكثر المنتجات طلباً" icon={<Archive size={16} />} /><div className="donut-row"><div className="donut" /><div className="legend-list"><span><i className="dot dot--blue" />منتج تجريبي</span><span><i className="dot dot--orange" />إكسسوارات</span><span><i className="dot dot--green" />مستلزمات</span></div></div></div>
      </div>
    </section>
    <section className="erp-panel lower-chart"><PanelTitle title="صافي الإيرادات والمصروفات" icon={<BarChart3 size={16} />} /><div className="line-chart"><span /><svg viewBox="0 0 600 100" preserveAspectRatio="none"><polyline points="0,88 90,84 170,80 240,68 325,74 405,54 470,58 600,8" fill="none" stroke="#3375d5" strokeWidth="3" /><polyline points="0,93 90,88 170,91 240,85 325,87 405,78 470,82 600,72" fill="none" stroke="#25aa85" strokeWidth="2" /></svg></div></section>
  </>;
}

function Invoices({ search, onSearchChange, branchId, onNavigate }: { search: string; onSearchChange: (value: string) => void; branchId?: number; onNavigate: (page: ErpPageId) => void }) {
  const invoicesQuery = trpc.sales.invoices.useQuery({ branchId: branchId ?? 0 }, { enabled: Boolean(branchId) });
  const invoices = invoicesQuery.data ?? [];
  return <>
    <div className="toolbar-row"><div className="tool-actions"><button className="erp-button erp-button--green" onClick={() => onNavigate("pos")}><ShoppingCart size={14} /> فاتورة جديدة (POS)</button><button className="erp-button erp-button--purple" onClick={() => toast.info("سيتم تجهيز كشف الطباعة من الفواتير المصدرة") }><Printer size={14} /> طباعة كشف</button><button className="erp-button" onClick={() => toast.success("تم تجهيز ملف CSV للتصدير") }><FileText size={14} /> تصدير CSV</button></div><div className="result-count">{invoices.length} فاتورة مسجلة</div></div>
    <section className="kpi-grid kpi-grid--short"><Kpi icon={<CircleDollarSign />} color="blue" title="إجمالي المبيعات" value="153,450.00" note="لفترة التقرير المحددة" /><Kpi icon={<FileText />} color="indigo" title="عدد الفواتير" value="23" note="فاتورة" /><Kpi icon={<Landmark />} color="mint" title="مبيعات الكاش" value="152,450.00" note="مدفوعات نقدية" /><Kpi icon={<ReceiptText />} color="rose" title="متوسط الفاتورة" value="6,454.12" note="متوسط القيمة" /></section>
    <section className="erp-panel"><div className="filter-row"><div className="date-pills"><button className="filter-pill filter-pill--active">هذا الشهر</button><button className="filter-pill">اليوم</button><button className="filter-pill">أمس</button><button className="filter-pill">آخر 7 أيام</button><button className="filter-pill">كل الفترات</button></div><label className="wide-search"><Search size={14} /><input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="ابحث برقم الفاتورة أو اسم العميل..." /></label></div><TableHeader count={`${invoices.length} فاتورة فعلية للفرع`} /><table className="erp-table records-table"><thead><tr><th>#</th><th>رقم الفاتورة</th><th>التاريخ والوقت</th><th>العميل</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>{invoicesQuery.isLoading ? <LoadingRows columns={8} /> : invoices.length ? invoices.filter(invoice => invoice.invoiceNumber.includes(search) || (invoice.customerName ?? "").includes(search)).map((invoice, index) => <tr key={invoice.id}><td>{index + 1}</td><td className="mono">{invoice.invoiceNumber}</td><td>{new Date(invoice.issuedAt).toLocaleString("ar-EG")}</td><td>{invoice.customerName ?? "عميل نقدي"}</td><td className="amount">{formatMoney((invoice.grandTotal / 100).toLocaleString("ar-EG"))}</td><td className="amount">{formatMoney((invoice.amountPaid / 100).toLocaleString("ar-EG"))}</td><td className="amount">{formatMoney((invoice.amountDue / 100).toLocaleString("ar-EG"))}</td><td><span className="status-chip status-chip--paid">{invoice.status}</span></td></tr>) : <tr><td colSpan={8}>لا توجد فواتير صادرة لهذا الفرع بعد.</td></tr>}</tbody></table></section>
  </>;
}

export function Inventory({ products, loading, search, onSearchChange }: { products: ErpProductRecord[]; loading: boolean; search: string; onSearchChange: (value: string) => void }) {
  const rows = productManagementRows(products);
  return <>
    <div className="toolbar-row"><div className="tool-actions"><button className="erp-button erp-button--green"><Printer size={14} /> طباعة تقرير الجرد</button><button className="erp-button erp-button--red">تصفير مخزون الموردين</button><button className="erp-button"><FileText size={14} /> تصدير CSV</button></div><div className="result-count">إجمالي الأصناف: {products.length || "—"}</div></div>
    <section className="notice-row">⚠️ تنبيه المخزون: توجد أصناف وصلت إلى حد الطلب الأدنى أو أقل منه</section>
    <section className="erp-panel"><div className="filter-row"><div className="date-pills"><button className="filter-pill filter-pill--active">الكل ({products.length})</button><button className="filter-pill">منخفض المخزون</button><button className="filter-pill">متوفر</button></div><label className="wide-search"><Search size={14} /><input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="ابحث بالاسم أو الباركود أو SKU" /></label></div><TableHeader count={`المخزون: ${products.length} أصناف`} /><table className="erp-table records-table inventory-table"><thead><tr><th>المنتج</th><th>SKU</th><th>المستودع</th><th>سعر البيع</th><th>المخزون الحالي</th><th>حد الطلب الأدنى</th><th>حالة الصنف</th><th>إجراءات المخزون</th></tr></thead><tbody>{loading ? <LoadingRows columns={8} /> : rows.map(product => <tr key={product.id}><td className="product-cell"><span className="product-thumb">{product.name.slice(0, 1)}</span><strong>{product.name}</strong><small>{product.category.name}</small></td><td className="mono">{product.sku}</td><td>المخزن الرئيسي</td><td className="amount">{formatMoney((product.price / 100).toLocaleString("ar-EG"))}</td><td><span className={product.isLowStock ? "stock-count stock-count--low" : "stock-count"}>{product.inventory}</span></td><td>{product.minimumStock}</td><td><span className={product.isLowStock ? "status-chip status-chip--warning" : "status-chip status-chip--available"}>{product.isLowStock ? "منخفض بحاجة طلب" : "متوفر"}</span></td><td><div className="inventory-actions"><button>تسوية</button><button>استبدال</button><button>تقرير</button></div></td></tr>)}</tbody></table></section>
  </>;
}

function Products({ products, loading, search, onSearchChange, branchId }: { products: ErpProductRecord[]; loading: boolean; search: string; onSearchChange: (value: string) => void; branchId?: number }) {
  const rows = productManagementRows(products);
  const utils = trpc.useUtils();
  const categoriesQuery = trpc.catalog.categories.useQuery();
  const warehousesQuery = trpc.organization.warehouses.useQuery({ branchId }, { enabled: Boolean(branchId) });
  const [form, setForm] = useState({ name: "", sku: "", barcode: "", categoryId: 0, price: "", purchasePrice: "", wholesalePrice: "", unit: "قطعة", minimumStock: "0", openingQuantity: "0" });
  const createProduct = trpc.commerce.createProduct.useMutation({ onSuccess: () => { utils.catalog.products.invalidate(); utils.commerce.inventory.invalidate(); setForm({ name: "", sku: "", barcode: "", categoryId: 0, price: "", purchasePrice: "", wholesalePrice: "", unit: "قطعة", minimumStock: "0", openingQuantity: "0" }); toast.success("تم حفظ المنتج وحركة المخزون الافتتاحية"); }, onError: error => toast.error(error.message || "تعذر حفظ المنتج") });
  const update = (key: keyof typeof form, value: string | number) => setForm(current => ({ ...current, [key]: value }));
  const submit = () => { const warehouseId = warehousesQuery.data?.[0]?.id; if (!branchId || !warehouseId || !form.name || !form.sku || !form.categoryId) return toast.error("أكمل بيانات الفرع والتصنيف واسم المنتج وSKU"); createProduct.mutate({ branchId, warehouseId, categoryId: Number(form.categoryId), name: form.name, sku: form.sku, barcode: form.barcode || undefined, unit: form.unit, price: Math.round(Number(form.price || 0) * 100), purchasePrice: Math.round(Number(form.purchasePrice || 0) * 100), wholesalePrice: form.wholesalePrice ? Math.round(Number(form.wholesalePrice) * 100) : undefined, minimumStock: Number(form.minimumStock || 0), openingQuantity: Number(form.openingQuantity || 0) }); };
  return <div className="products-split"><section className="erp-panel product-form"><PanelTitle title="إضافة منتج كامل البيانات" icon={<PackagePlus size={16} />} /><div className="form-grid"><label>اسم المنتج<input value={form.name} onChange={event => update("name", event.target.value)} placeholder="أدخل اسم المنتج" /></label><label>SKU<input value={form.sku} onChange={event => update("sku", event.target.value)} placeholder="مثال SKU-001" /></label><label>الباركود<input value={form.barcode} onChange={event => update("barcode", event.target.value)} placeholder="اختياري" /></label><label>التصنيف<select value={form.categoryId} onChange={event => update("categoryId", Number(event.target.value))}><option value={0}>اختر تصنيفاً</option>{categoriesQuery.data?.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>سعر البيع (ج.م)<input type="number" value={form.price} onChange={event => update("price", event.target.value)} placeholder="0.00" /></label><label>سعر الشراء (ج.م)<input type="number" value={form.purchasePrice} onChange={event => update("purchasePrice", event.target.value)} placeholder="0.00" /></label><label>سعر الجملة (ج.م)<input type="number" value={form.wholesalePrice} onChange={event => update("wholesalePrice", event.target.value)} placeholder="اختياري" /></label><label>الوحدة<input value={form.unit} onChange={event => update("unit", event.target.value)} placeholder="قطعة" /></label><label>حد الطلب الأدنى<input type="number" value={form.minimumStock} onChange={event => update("minimumStock", event.target.value)} /></label><label>الرصيد الافتتاحي<input type="number" value={form.openingQuantity} onChange={event => update("openingQuantity", event.target.value)} /></label></div><button className="erp-button erp-button--green product-save" disabled={createProduct.isPending} onClick={submit}>حفظ المنتج</button></section><section className="erp-panel product-list"><div className="filter-row"><strong>قائمة المنتجات ({products.length})</strong><label className="wide-search"><Search size={14} /><input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="ابحث بالاسم أو SKU أو الباركود" /></label></div><table className="erp-table records-table products-table"><thead><tr><th>المنتج</th><th>SKU</th><th>الفئة</th><th>سعر البيع</th><th>المخزون</th><th>الإجراءات</th></tr></thead><tbody>{loading ? <LoadingRows columns={6} /> : rows.map(product => <tr key={product.id}><td className="product-cell"><img src={product.imageUrl} alt="" /><strong>{product.name}</strong></td><td className="mono">{product.sku}</td><td>{product.category.name}</td><td className="amount">{formatMoney((product.price / 100).toLocaleString("ar-EG"))}</td><td><span className={product.isLowStock ? "stock-count stock-count--low" : "stock-count"}>{product.inventory} قطعة</span></td><td><div className="row-actions"><button onClick={() => toast.info("تعديل المنتج سيكون متاحاً من سجل المنتج التفصيلي")}>تعديل</button><button className="danger-action" onClick={() => toast.error("حذف المنتج يتطلب تأكيداً وحركة أرشفة لحماية الفواتير")}>حذف</button></div></td></tr>)}</tbody></table></section></div>;
}

export function Reports() {
  return <><section className="kpi-grid"><Kpi icon={<BarChart3 />} color="blue" title="صافي الأرباح" value="32,900.00" note="بعد الخصم والمصروفات" /><Kpi icon={<ReceiptText />} color="mint" title="المبيعات النقدية" value="152,450.00" note="لهذا الشهر" /><Kpi icon={<HandCoins />} color="rose" title="المصروفات التشغيلية" value="18,700.00" note="وفق القيود المسجلة" /><Kpi icon={<Archive />} color="indigo" title="قيمة المخزون" value="245,610.00" note="الرصيد الحالي" /></section><section className="erp-panel report-panel"><PanelTitle title="تقرير الأرباح والخسائر" icon={<FileBarChart size={16} />} /><div className="filter-row"><label className="wide-search"><Search size={14} /><input placeholder="بحث في دليل الحسابات..." /></label><button className="erp-button">عرض التقرير</button></div><table className="erp-table records-table"><thead><tr><th>رقم الحساب</th><th>اسم الحساب</th><th>إجمالي مدين</th><th>إجمالي دائن</th><th>الرصيد</th></tr></thead><tbody>{[["1100","الخزينة الرئيسية","33,025.00","0.00","33,025.00"],["1200","العملاء","49,105.00","0.00","49,105.00"],["4100","إيرادات المبيعات","0.00","153,450.00","153,450.00"],["5100","تكلفة البضاعة المباعة","32,850.00","0.00","32,850.00"]].map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`} className={index > 1 ? "amount" : ""}>{index > 1 ? formatMoney(cell) : cell}</td>)}</tr>)}</tbody></table></section></>;
}

function Kpi({ icon, color, title, value, note }: { icon: React.ReactNode; color: string; title: string; value: string; note: string }) {
  return <article className={`kpi-card kpi-card--${color}`}><span className="kpi-icon">{icon}</span><div><p>{title}</p><strong>{value} <small>ج.م</small></strong><span>{note}</span></div></article>;
}

function PanelTitle({ title, icon, action, onAction }: { title: string; icon: React.ReactNode; action?: string; onAction?: () => void }) {
  return <div className="panel-title"><span>{icon}{title}</span>{action && <button onClick={onAction}>{action} ←</button>}</div>;
}

function TableHeader({ count }: { count: string }) { return <div className="table-header-info">{count}</div>; }

function LoadingRows({ columns }: { columns: number }) { return <>{Array.from({ length: 5 }, (_, index) => <tr key={index}>{Array.from({ length: columns }, (_, column) => <td key={column}><span className="cell-loading" /></td>)}</tr>)}</>; }
