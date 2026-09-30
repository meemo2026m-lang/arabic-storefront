import { trpc } from "@/lib/trpc";
import { Boxes, Truck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function OperationalDirectory({ type, branchId }: { type: "inventory" | "customers" | "suppliers"; branchId?: number }) {
  const utils = trpc.useUtils();
  const inventory = trpc.commerce.inventory.useQuery({ branchId }, { enabled: type === "inventory" && Boolean(branchId) });
  const customers = trpc.commerce.customers.useQuery({ branchId }, { enabled: type === "customers" && Boolean(branchId) });
  const suppliers = trpc.commerce.suppliers.useQuery({ branchId }, { enabled: type === "suppliers" && Boolean(branchId) });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [limit, setLimit] = useState("0");
  const addCustomer = trpc.commerce.createCustomer.useMutation({ onSuccess: () => { utils.commerce.customers.invalidate(); setName(""); setPhone(""); toast.success("تم حفظ العميل"); }, onError: error => toast.error(error.message || "تعذر حفظ العميل") });
  const addSupplier = trpc.commerce.createSupplier.useMutation({ onSuccess: () => { utils.commerce.suppliers.invalidate(); setName(""); setPhone(""); toast.success("تم حفظ المورد"); }, onError: error => toast.error(error.message || "تعذر حفظ المورد") });
  if (!branchId) return <section className="erp-panel empty-state">جارٍ تحديد الفرع النشط...</section>;
  if (type === "inventory") return <section className="erp-panel operational-table"><div className="panel-title"><span><Boxes size={16} />المخزون الفعلي للفرع</span><span>{inventory.data?.length ?? 0} صنف</span></div><table className="erp-table records-table"><thead><tr><th>الصنف</th><th>SKU / باركود</th><th>المستودع</th><th>الرصيد</th><th>حد الطلب</th><th>سعر البيع</th></tr></thead><tbody>{inventory.isLoading ? <tr><td colSpan={6}>جارٍ تحميل المخزون...</td></tr> : inventory.data?.map(row => <tr key={`${row.id}-${row.warehouseId}`}><td><strong>{row.name}</strong><small>{row.categoryName}</small></td><td><span className="mono">{row.sku}</span><small>{row.barcode}</small></td><td>{row.warehouseName}</td><td className={row.quantity <= row.minimumStock ? "stock-count stock-count--low" : "stock-count"}>{row.quantity} {row.unit}</td><td>{row.minimumStock}</td><td className="amount">{(row.price / 100).toLocaleString("ar-EG")} ج.م</td></tr>)}</tbody></table></section>;
  const isCustomer = type === "customers";
  const rows = isCustomer ? customers.data ?? [] : suppliers.data ?? [];
  const Icon = isCustomer ? Users : Truck;
  const create = () => { if (!name) return; if (isCustomer) addCustomer.mutate({ branchId, type: "individual", name, phone: phone || undefined, openingBalance: 0, creditLimit: Number(limit) * 100 }); else addSupplier.mutate({ branchId, name, phone: phone || undefined, openingBalance: 0, creditLimit: Number(limit) * 100 }); };
  return <section className="directory-layout"><section className="erp-panel operational-table"><div className="panel-title"><span><Icon size={16} />{isCustomer ? "سجل العملاء" : "سجل الموردين"}</span><span>{rows.length} سجلات</span></div><table className="erp-table records-table"><thead><tr><th>الاسم</th><th>الهاتف</th><th>الرصيد الافتتاحي</th><th>الحد الائتماني</th><th>الحالة</th></tr></thead><tbody>{rows.length ? rows.map(row => <tr key={row.id}><td><strong>{row.name}</strong><small>{isCustomer ? (row as typeof customers.data extends (infer T)[] | undefined ? T : never).type : (row as typeof suppliers.data extends (infer T)[] | undefined ? T : never).paymentTerms}</small></td><td>{row.phone ?? "—"}</td><td className="amount">{(row.openingBalance / 100).toLocaleString("ar-EG")} ج.م</td><td className="amount">{(row.creditLimit / 100).toLocaleString("ar-EG")} ج.م</td><td><span className="status-chip status-chip--available">نشط</span></td></tr>) : <tr><td colSpan={5}>لا توجد سجلات بعد.</td></tr>}</tbody></table></section><section className="erp-panel directory-form"><div className="panel-title"><span><Icon size={16} />إضافة {isCustomer ? "عميل" : "مورد"}</span></div><label>الاسم<input value={name} onChange={event => setName(event.target.value)} placeholder="الاسم الكامل" /></label><label>الهاتف<input value={phone} onChange={event => setPhone(event.target.value)} placeholder="01xxxxxxxxx" /></label><label>الحد الائتماني (جنيه)<input type="number" min="0" value={limit} onChange={event => setLimit(event.target.value)} /></label><button className="erp-button erp-button--green" onClick={create}>{isCustomer ? "حفظ العميل" : "حفظ المورد"}</button></section></section>;
}
