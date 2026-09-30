import { CartDrawer } from "@/components/CartDrawer";
import { StoreHeader } from "@/components/StoreHeader";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/cart";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";

export default function ProductDetails() {
  const [, params] = useRoute("/products/:id");
  const productId = Number(params?.id ?? 0);
  const productQuery = trpc.catalog.product.useQuery({ id: productId || 1 });
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const product = productQuery.data;

  if (productQuery.isLoading) return <div className="page-loading">جارٍ تحميل التفاصيل…</div>;
  if (!product) return <div className="page-loading">تعذر العثور على المنتج.</div>;

  return (
    <div className="store-shell">
      <StoreHeader />
      <main className="page-wrap product-page">
        <Link href="/" className="back-link"><ArrowRight size={17} /> العودة إلى المتجر</Link>
        <section className="product-detail-card">
          <div className="product-detail__gallery">
            <span className="gallery-accent" />
            <img src={product.imageUrl} alt={product.name} />
            {product.badge && <span className="product-badge">{product.badge}</span>}
          </div>
          <div className="product-detail__content">
            <span className="eyebrow">{product.category.name}</span>
            <h1>{product.name}</h1>
            <div className="detail-price">
              <strong>{formatCurrency(product.price)}</strong>
              {product.compareAtPrice && <del>{formatCurrency(product.compareAtPrice)}</del>}
            </div>
            <p className="product-detail__description">{product.description}</p>
            <div className="detail-points">
              <span><Check size={16} /> واجهة شراء عربية سهلة وواضحة</span>
              <span><Check size={16} /> تعديل الكمية مباشرة من السلة</span>
            </div>
            <div className="detail-actions">
              <div className="quantity-control quantity-control--large" aria-label="الكمية">
                <button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} aria-label="إنقاص الكمية"><Minus size={16} /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(value => value + 1)} aria-label="زيادة الكمية"><Plus size={16} /></button>
              </div>
              <button type="button" className="add-to-cart add-to-cart--large" onClick={() => addItem(product, quantity)}><ShoppingBag size={18} /> أضف إلى السلة</button>
            </div>
          </div>
        </section>
      </main>
      <CartDrawer />
    </div>
  );
}
