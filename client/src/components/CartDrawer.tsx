import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/cart";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function CartDrawer() {
  const { lines, total, isOpen, closeCart, removeItem, updateQuantity } = useCart();

  return (
    <div className={`cart-layer ${isOpen ? "cart-layer--open" : ""}`} aria-hidden={!isOpen}>
      <button className="cart-layer__backdrop" type="button" onClick={closeCart} tabIndex={isOpen ? 0 : -1} aria-label="إغلاق السلة" />
      <aside className="cart-drawer" aria-label="سلة التسوق">
        <div className="cart-drawer__head">
          <div>
            <span className="eyebrow">طلبك</span>
            <h2>سلة التسوق</h2>
          </div>
          <button className="icon-button" type="button" onClick={closeCart} aria-label="إغلاق"><X size={20} /></button>
        </div>
        <div className="cart-drawer__content">
          {lines.length === 0 ? (
            <div className="empty-cart">
              <span className="empty-cart__icon"><ShoppingBag size={25} /></span>
              <h3>السلة بانتظار اختياراتك</h3>
              <p>أضف ما يعجبك وسيظهر هنا بشكل واضح وسهل التعديل.</p>
              <button type="button" className="text-button" onClick={closeCart}>متابعة التسوق</button>
            </div>
          ) : lines.map(line => (
            <article className="cart-line" key={line.id}>
              <img src={line.imageUrl} alt="" />
              <div className="cart-line__info">
                <div className="cart-line__top">
                  <h3>{line.name}</h3>
                  <button type="button" onClick={() => removeItem(line.id)} aria-label={`حذف ${line.name}`}><Trash2 size={16} /></button>
                </div>
                <p>{formatCurrency(line.price)}</p>
                <div className="quantity-control" aria-label={`كمية ${line.name}`}>
                  <button type="button" onClick={() => updateQuantity(line.id, line.quantity - 1)} aria-label="إنقاص الكمية"><Minus size={13} /></button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(line.id, line.quantity + 1)} aria-label="زيادة الكمية"><Plus size={13} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {lines.length > 0 && <div className="cart-drawer__foot">
          <div className="cart-total"><span>الإجمالي</span><strong>{formatCurrency(total)}</strong></div>
          <button type="button" className="checkout-button" onClick={() => toast("تم تجهيز طلبك للمراجعة", { description: "سيتم تأكيد تفاصيل الطلب قبل إتمام الشراء." })}>إتمام الطلب</button>
          <p>تتم مراجعة تفاصيل الطلب قبل التأكيد.</p>
        </div>}
      </aside>
    </div>
  );
}
