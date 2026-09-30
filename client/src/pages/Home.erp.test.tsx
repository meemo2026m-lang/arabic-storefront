import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ErpNavigationTestbed, ErpPageHeading, Inventory, Reports } from "./Home";

// @vitest-environment jsdom

describe("ERP page components", () => {
  it("renders the visible page heading for an inventory navigation state", () => {
    const html = renderToStaticMarkup(<ErpPageHeading page="inventory" />);
    expect(html).toContain("مراقبة المخزون والأصناف");
  });

  it("renders database-backed product data into the inventory management table", () => {
    const html = renderToStaticMarkup(<Inventory loading={false} search="" onSearchChange={() => undefined} products={[{ id: 9, name: "منتج مخزني", price: 24500, imageUrl: "/product.jpg", category: { name: "مختارات المنزل" } }]} />);
    expect(html).toContain("منتج مخزني");
    expect(html).toContain("PRD-1001");
    expect(html).toContain("مختارات المنزل");
  });

  it("changes the visible ERP page title after a quick-action click", async () => {
    const user = userEvent.setup();
    render(<ErpNavigationTestbed />);
    expect(screen.getByRole("heading", { name: "لوحة التحكم الرئيسية" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "دليل المنتجات والخدمات" }));
    expect(screen.getByRole("heading", { name: "دليل المنتجات والخدمات" })).toBeTruthy();
  });

  it("renders repeated financial values without emitting duplicate-key warnings", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<Reports />);
    const duplicateKeyWarning = consoleError.mock.calls.some(([message]) => typeof message === "string" && message.includes("same key"));
    expect(duplicateKeyWarning).toBe(false);
    consoleError.mockRestore();
  });
});
