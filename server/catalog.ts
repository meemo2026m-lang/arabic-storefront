import { and, asc, count, eq, like, or } from "drizzle-orm";
import { categories, products } from "../drizzle/schema";
import { getDb } from "./db";

const demoCategories = [
  { name: "مختارات المنزل", slug: "home", sortOrder: 1 },
  { name: "العناية اليومية", slug: "care", sortOrder: 2 },
  { name: "إكسسوارات", slug: "accessories", sortOrder: 3 },
] as const;

const demoProducts = [
  { category: "home", name: "طقم ضيافة عصري", description: "تنسيق هادئ من قطع منزلية مختارة لتفاصيل يومية أجمل.", price: 24500, compareAtPrice: 29500, imageUrl: "/manus-storage/product-home_f166c1d4.webp", badge: "عرض خاص", isFeatured: 1, sortOrder: 1 },
  { category: "care", name: "مجموعة عناية يومية", description: "مجموعة عملية مصممة لروتين عناية بسيط وأنيق.", price: 18500, compareAtPrice: null, imageUrl: "/manus-storage/product-lifestyle_80f1bc7e.jpg", badge: "وصل حديثاً", isFeatured: 1, sortOrder: 2 },
  { category: "accessories", name: "إكسسوار بتفاصيل راقية", description: "قطعة مختارة تضيف لمسة ناعمة ومتوازنة إلى يومك.", price: 12900, compareAtPrice: 15900, imageUrl: "/manus-storage/product-accessories_4efc1608.png", badge: null, isFeatured: 0, sortOrder: 3 },
  { category: "home", name: "تفاصيل منزلية دافئة", description: "اختيار بسيط بملمس أنيق ينسجم مع مختلف المساحات.", price: 19900, compareAtPrice: null, imageUrl: "/manus-storage/product-home_f166c1d4.webp", badge: null, isFeatured: 0, sortOrder: 4 },
  { category: "care", name: "عناية هادئة", description: "منتج عرض مصمم لإبراز تجربة شراء راقية وسهلة.", price: 9900, compareAtPrice: null, imageUrl: "/manus-storage/product-lifestyle_80f1bc7e.jpg", badge: "الأكثر اختياراً", isFeatured: 0, sortOrder: 5 },
  { category: "accessories", name: "قطعة يومية مميزة", description: "تفصيل عملي بلمسة بصرية نظيفة ومتقنة.", price: 14900, compareAtPrice: null, imageUrl: "/manus-storage/product-accessories_4efc1608.png", badge: null, isFeatured: 0, sortOrder: 6 },
] as const;

async function ensureDemoCatalog() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ value: count() }).from(products);
  if ((existing[0]?.value ?? 0) > 0) return;

  await db.insert(categories).values([...demoCategories]);
  const savedCategories = await db.select().from(categories);
  const categoryIds = new Map(savedCategories.map(category => [category.slug, category.id]));
  await db.insert(products).values(
    demoProducts.map(product => ({
      categoryId: categoryIds.get(product.category)!,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.imageUrl,
      badge: product.badge,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
    })),
  );
}

export async function listCategories() {
  await ensureDemoCatalog();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function listProducts(input: { categorySlug?: string; search?: string }) {
  await ensureDemoCatalog();
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (input.categorySlug && input.categorySlug !== "all") {
    conditions.push(eq(categories.slug, input.categorySlug));
  }
  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    conditions.push(or(like(products.name, term), like(products.description, term)));
  }

  const query = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      badge: products.badge,
      isFeatured: products.isFeatured,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));

  if (conditions.length) {
    return query.where(and(...conditions)).orderBy(asc(products.sortOrder));
  }
  return query.orderBy(asc(products.sortOrder));
}

export async function getProductById(id: number) {
  await ensureDemoCatalog();
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      imageUrl: products.imageUrl,
      badge: products.badge,
      category: { id: categories.id, name: categories.name, slug: categories.slug },
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);
  return rows[0];
}
