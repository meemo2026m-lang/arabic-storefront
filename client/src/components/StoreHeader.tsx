import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

type StoreHeaderProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
};

export function StoreHeader({ search = "", onSearchChange }: StoreHeaderProps) {
  const { count, openCart } = useCart();

  return (
    <header className="store-header">
      <div className="offer-strip">
        <div className="page-wrap offer-strip__inner">
          <span>تجربة تسوّق مُرتّبة بلمسة راقية</span>
          <span className="offer-strip__dot" aria-hidden="true" />
          <span>اكتشف اختيارات المتجر لهذا الموسم</span>
        </div>
      </div>
      <div className="store-nav">
        <div className="page-wrap store-nav__inner">
          <Link href="/" className="brand" aria-label="العودة إلى الرئيسية">
            <span className="brand__mark">م</span>
            <span>متجري</span>
          </Link>
          <nav className="store-links" aria-label="التنقل الرئيسي">
            <Link href="/">الرئيسية</Link>
            <a href="#products">المنتجات</a>
            <a href="#collections">المجموعات</a>
          </nav>
          <div className="store-actions">
            <label className="store-search">
              <Search size={17} aria-hidden="true" />
              <input value={search} onChange={event => onSearchChange?.(event.target.value)} placeholder="ابحث في المتجر" aria-label="البحث في المنتجات" />
            </label>
            <button className="cart-trigger" type="button" onClick={openCart} aria-label={`السلة، ${count} عناصر`}>
              <ShoppingBag size={20} strokeWidth={1.8} />
              {count > 0 && <span className="cart-trigger__count">{count}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
