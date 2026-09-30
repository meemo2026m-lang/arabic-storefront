import { describe, expect, it } from "vitest";
import { addCartLine, cartCount, cartTotal, removeCartLine, updateCartLine } from "./cart";

const product = { id: 1, name: "منتج تجريبي", price: 12500, imageUrl: "/sample.jpg" };

describe("cart helpers", () => {
  it("merges duplicate products and calculates totals in halalas", () => {
    const lines = addCartLine(addCartLine([], product), product, 2);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(3);
    expect(cartCount(lines)).toBe(3);
    expect(cartTotal(lines)).toBe(37500);
  });

  it("updates and removes a line safely", () => {
    const lines = addCartLine([], product);
    expect(updateCartLine(lines, product.id, 0)).toEqual([]);
    expect(removeCartLine(lines, product.id)).toEqual([]);
  });
});
