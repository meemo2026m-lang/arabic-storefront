export type CartProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

export type CartLine = CartProduct & { quantity: number };

export function addCartLine(lines: CartLine[], product: CartProduct, quantity = 1): CartLine[] {
  const existing = lines.find(line => line.id === product.id);
  if (existing) {
    return lines.map(line => line.id === product.id ? { ...line, quantity: line.quantity + quantity } : line);
  }
  return [...lines, { ...product, quantity }];
}

export function updateCartLine(lines: CartLine[], productId: number, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter(line => line.id !== productId);
  return lines.map(line => line.id === productId ? { ...line, quantity } : line);
}

export function removeCartLine(lines: CartLine[], productId: number): CartLine[] {
  return lines.filter(line => line.id !== productId);
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.price * line.quantity, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", minimumFractionDigits: 0 }).format(amount / 100);
}
