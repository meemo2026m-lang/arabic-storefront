import { trpc } from "@/lib/trpc";
import { Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type CartLine = { productId: number; name: string; price: number; quantity: number; available: number };

export function PosPage({ branchId }: { branchId?: number }) {
  const utils = trpc.useUtils();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [discount, setDiscount] = useState("0");
  const [paymentAmount, setPaymentAmount] = useState("");
  const inventoryQuery = trpc.commerce.inventory.useQuery({ branchId }, { enabled: Boolean(branchId) });
  const customersQuery = trpc.commerce.customers.useQuery({ branchId }, { enabled: Boolean(branchId) });
  const warehousesQuery = trpc.organization.warehouses.useQuery({ branchId }, { enabled: Boolean(branchId) });
  const accountsQuery = trpc.sales.cashAccounts.useQuery({ branchId: branchId ?? 0 }, { enabled: Boolean(branchId) });
  const [accountId, setAccountId] = useState<number | undefined>();
  const items = inventoryQuery.data?.filter(item => item.name.includes(query) || item.sku.includes(query) || (item.barcode ?? "").includes(query)) ?? [];
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discountCents = Math.min(Math.round(Number(discount || 0) * 100), subtotal);
  const vat = Math.round((subtotal - discountCents) * 0.14);
  const total = subtotal - discountCents + vat;
  const paidCents = Math.min(Math.round(Number(paymentAmount || 0) * 100), total);
  const addProduct = (item: NonNullable<typeof inventoryQuery.data>[number]) => setCart(current => { const existing = current.find(line => line.productId === item.id); if (existing) return current.map(line => line.productId === item.id ? { ...line, quantity: Math.min(line.quantity + 1, item.quantity) } : line); return [...current, { productId: item.id, name: item.name, price: item.price, quantity: 1, available: item.quantity }]; });
  const changeQuantity = (productId: number, delta: number) => setCart(current => current.flatMap(line => { const quantity = Math.min(line.available, line.quantity + delta); return quantity > 0 ? [{ ...line, quantity }] : []; }));
  const issue = trpc.sales.issue.useMutation({ onSuccess: result => { utils.sales.invoices.invalidate(); utils.commerce.inventory.invalidate(); setCart([]); setPaymentAmount(""); toast.success(`تم إصدار ${result.invoiceNumber} بإجمالي ${(result.grandTotal / 100).toLocaleString("ar-EG")} ج.م`); }, onError: error => toast.error(error.message || "تعذر إصدار الفاتورة") });
  const submit = () => { const warehouseId = warehousesQuery.data?.[0]?.id; const defaultAccountId = accountId ?? accountsQuery.data?.[0]?.id; if (!branchId || !warehouseId || !cart.length) return toast.error("أضف منتجات إلى السلة أولاً"); if (paidCents > 0 && !defaultAccountId) return toast.error("اختر خزنة أو وسيلة دفع"); issue.mutate({ branchId, warehouseId, customerId, discountTotal: discountCents, items: cart.map(line => ({ productId: line.productId, quantity: line.quantity })), payments: paidCents ? [{ cashAccountId: defaultAccountId, method: "cash", amount: paidCents }] : [], notes: "فاتورة من شاشة البيع السريع" }); };
  return <section className="pos-layout"><section className="erp-panel pos-products"><div className="pos-head"><strong><ShoppingCart size={16} />شاشة البيع السريعة</strong><label className="wide-search"><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث بالاسم أو SKU أو الباركود" /></label></div><div className="pos-product-grid">{items.map(item => <button type="button" key={item.id} className="pos-product" disabled={item.quantity <= 0} onClick={() => addProduct(item)}><strong>{item.name}</strong><span>{(item.price / 100).toLocaleString("ar-EG")} ج.م</span><small>متاح: {item.quantity} {item.unit}</small></button>)}</div></section><aside className="erp-panel pos-cart"><div className="panel-title"><span>سلة الفاتورة</span><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} أصناف</span></div><div className="pos-lines">{cart.length ? cart.map(line => <div key={line.productId} className="pos-line"><div><strong>{line.name}</strong><small>{(line.price / 100).toLocaleString("ar-EG")} ج.م</small></div><div className="qty-actions"><button onClick={() => changeQuantity(line.productId, -1)}><Minus size={12} /></button><b>{line.quantity}</b><button onClick={() => changeQuantity(line.productId, 1)}><Plus size={12} /></button></div></div>) : <p>السلة فارغة. اختر منتجاً لبدء الفاتورة.</p>}</div><div className="pos-options"><label>العميل<select value={customerId ?? ""} onChange={event => setCustomerId(event.target.value ? Number(event.target.value) : undefined)}><option value="">عميل نقدي</option>{customersQuery.data?.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label><label>الخصم (ج.م)<input type="number" value={discount} onChange={event => setDiscount(event.target.value)} /></label><label>الخزنة / الدفع<select value={accountId ?? ""} onChange={event => setAccountId(event.target.value ? Number(event.target.value) : undefined)}><option value="">الخزنة الافتراضية</option>{accountsQuery.data?.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>المبلغ المدفوع (ج.م)<input type="number" value={paymentAmount} onChange={event => setPaymentAmount(event.target.value)} placeholder={(total / 100).toFixed(2)} /></label></div><div className="pos-total"><span>الإجمالي قبل الضريبة <b>{(subtotal / 100).toLocaleString("ar-EG")} ج.م</b></span><span>ضريبة القيمة المضافة <b>{(vat / 100).toLocaleString("ar-EG")} ج.م</b></span><strong>الإجمالي النهائي <b>{(total / 100).toLocaleString("ar-EG")} ج.م</b></strong></div><button className="erp-button erp-button--green pos-submit" disabled={issue.isPending || !cart.length} onClick={submit}>إصدار الفاتورة</button></aside></section>;
}
