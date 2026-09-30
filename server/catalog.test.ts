import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./catalog", () => ({
  getProductById: vi.fn(),
  listCategories: vi.fn(),
  listProducts: vi.fn(),
}));

import { getProductById, listCategories, listProducts } from "./catalog";
import { appRouter } from "./routers";

const context = { user: null } as unknown as TrpcContext;
const categoryRows = [{ id: 1, name: "مختارات المنزل", slug: "home", sortOrder: 1, createdAt: new Date() }];
const productRow = {
  id: 1,
  name: "طقم ضيافة عصري",
  description: "وصف تجريبي",
  price: 24500,
  compareAtPrice: 29500,
  imageUrl: "/manus-storage/example.jpg",
  badge: "عرض خاص",
  isFeatured: 1,
  category: { id: 1, name: "مختارات المنزل", slug: "home" },
};

describe("catalog public procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the category list from the catalog query", async () => {
    vi.mocked(listCategories).mockResolvedValue(categoryRows);
    const result = await appRouter.createCaller(context).catalog.categories();

    expect(result).toEqual(categoryRows);
    expect(listCategories).toHaveBeenCalledOnce();
  });

  it("passes category and search filters through to the product query", async () => {
    vi.mocked(listProducts).mockResolvedValue([productRow]);
    const result = await appRouter.createCaller(context).catalog.products({ categorySlug: "home", search: "ضيافة" });

    expect(result).toEqual([productRow]);
    expect(listProducts).toHaveBeenCalledWith({ categorySlug: "home", search: "ضيافة" });
  });

  it("looks up a single product by its numeric identifier", async () => {
    vi.mocked(getProductById).mockResolvedValue(productRow);
    const result = await appRouter.createCaller(context).catalog.product({ id: 1 });

    expect(result).toEqual(productRow);
    expect(getProductById).toHaveBeenCalledWith(1);
  });
});
