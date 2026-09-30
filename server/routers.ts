import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createAccessUser, listAccessPermissions, listAccessRoles, listAccessUsers, setUserPermission, setUserRole, updateAccessUser } from "./access";
import { getProductById, listCategories, listProducts } from "./catalog";
import { createCustomer, createOperationalProduct, createSupplier, listCustomers, listInventory, listSuppliers } from "./commerce";
import { getSalesInvoiceDetails, issueSale, issueSalesReturn, listCashAccounts, listSalesInvoices } from "./sales";
import { getBranchReport, transferCash } from "./finance";
import { getNetworkStatus, recordNetworkClient } from "./network";
import { createBranch, getBusinessSettings, listBranches, listWarehouses, updateBusinessSettings } from "./organization";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  catalog: router({
    categories: publicProcedure.query(() => listCategories()),
    products: publicProcedure
      .input(z.object({ categorySlug: z.string().optional(), search: z.string().optional() }).optional())
      .query(({ input }) => listProducts(input ?? {})),
    product: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(({ input }) => getProductById(input.id)),
  }),
  access: router({
    users: publicProcedure.query(() => listAccessUsers()),
    roles: publicProcedure.query(() => listAccessRoles()),
    permissions: publicProcedure.query(() => listAccessPermissions()),
    createUser: adminProcedure.input(z.object({ name: z.string().min(2), email: z.string().email().optional(), roleId: z.number().int().positive() })).mutation(({ input }) => createAccessUser(input)),
    updateUser: adminProcedure.input(z.object({ userId: z.number().int().positive(), name: z.string().min(2), email: z.string().email().optional(), isActive: z.boolean() })).mutation(({ input }) => updateAccessUser(input)),
    assignRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), roleId: z.number().int().positive() })).mutation(({ input }) => setUserRole(input.userId, input.roleId)),
    setPermission: adminProcedure.input(z.object({ userId: z.number().int().positive(), permissionId: z.number().int().positive(), isAllowed: z.boolean() })).mutation(({ input }) => setUserPermission(input.userId, input.permissionId, input.isAllowed)),
  }),
  organization: router({
    branches: publicProcedure.query(() => listBranches()),
    warehouses: publicProcedure.input(z.object({ branchId: z.number().int().positive().optional() }).optional()).query(({ input }) => listWarehouses(input?.branchId)),
    settings: publicProcedure.query(() => getBusinessSettings()),
    createBranch: adminProcedure.input(z.object({ name: z.string().min(2), code: z.string().min(2).max(48), color: z.string().min(4).max(24), address: z.string().optional(), phone: z.string().optional() })).mutation(({ input }) => createBranch(input)),
    updateSettings: adminProcedure.input(z.object({ businessName: z.string().min(2), address: z.string().optional(), taxNumber: z.string().optional(), vatEnabled: z.boolean(), vatRateBps: z.number().int().min(0).max(10000), receiptPromoText: z.string().optional(), receiptPromoUrl: z.string().url().optional(), receiptFormat: z.enum(["58mm", "80mm", "a4"]), theme: z.enum(["light", "dark", "navy"]), loyaltyEnabled: z.boolean() })).mutation(({ input }) => updateBusinessSettings(input)),
  }),
  commerce: router({
    inventory: publicProcedure.input(z.object({ branchId: z.number().int().positive().optional() }).optional()).query(({ input }) => listInventory(input?.branchId)),
    customers: publicProcedure.input(z.object({ branchId: z.number().int().positive().optional() }).optional()).query(({ input }) => listCustomers(input?.branchId)),
    suppliers: publicProcedure.input(z.object({ branchId: z.number().int().positive().optional() }).optional()).query(({ input }) => listSuppliers(input?.branchId)),
    createProduct: adminProcedure.input(z.object({ categoryId: z.number().int().positive(), branchId: z.number().int().positive(), warehouseId: z.number().int().positive(), name: z.string().min(2), description: z.string().optional(), price: z.number().int().min(0), purchasePrice: z.number().int().min(0), wholesalePrice: z.number().int().min(0).optional(), sku: z.string().min(2), barcode: z.string().optional(), unit: z.string().min(1), minimumStock: z.number().int().min(0), openingQuantity: z.number().int().min(0) })).mutation(({ input }) => createOperationalProduct(input)),
    createCustomer: adminProcedure.input(z.object({ branchId: z.number().int().positive(), type: z.enum(["individual", "company", "institution"]), name: z.string().min(2), phone: z.string().optional(), email: z.string().email().optional(), taxNumber: z.string().optional(), address: z.string().optional(), city: z.string().optional(), openingBalance: z.number().int(), creditLimit: z.number().int().min(0), notes: z.string().optional() })).mutation(({ input }) => createCustomer(input)),
    createSupplier: adminProcedure.input(z.object({ branchId: z.number().int().positive(), name: z.string().min(2), phone: z.string().optional(), email: z.string().email().optional(), taxNumber: z.string().optional(), contactName: z.string().optional(), address: z.string().optional(), city: z.string().optional(), openingBalance: z.number().int(), creditLimit: z.number().int().min(0), paymentTerms: z.string().optional(), notes: z.string().optional() })).mutation(({ input }) => createSupplier(input)),
  }),
  sales: router({
    cashAccounts: publicProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => listCashAccounts(input.branchId)),
    invoices: publicProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => listSalesInvoices(input.branchId)),
    invoiceDetails: publicProcedure.input(z.object({ invoiceId: z.number().int().positive() })).query(({ input }) => getSalesInvoiceDetails(input.invoiceId)),
    issue: adminProcedure.input(z.object({ branchId: z.number().int().positive(), warehouseId: z.number().int().positive(), customerId: z.number().int().positive().optional(), discountTotal: z.number().int().min(0), items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive() })).min(1), payments: z.array(z.object({ cashAccountId: z.number().int().positive().optional(), method: z.enum(["cash", "network", "wallet", "bank", "credit"]), amount: z.number().int().min(0) })), notes: z.string().optional() })).mutation(({ input, ctx }) => issueSale(input, ctx.user.id)),
    return: adminProcedure.input(z.object({ invoiceId: z.number().int().positive(), refundCashAccountId: z.number().int().positive().optional(), reason: z.string().optional(), items: z.array(z.object({ invoiceItemId: z.number().int().positive(), quantity: z.number().int().positive(), reason: z.string().optional() })).min(1) })).mutation(({ input, ctx }) => issueSalesReturn(input, ctx.user.id)),
  }),
  finance: router({
    report: publicProcedure.input(z.object({ branchId: z.number().int().positive() })).query(({ input }) => getBranchReport(input.branchId)),
    transfer: adminProcedure.input(z.object({ branchId: z.number().int().positive(), fromCashAccountId: z.number().int().positive(), toCashAccountId: z.number().int().positive(), amount: z.number().int().positive(), reason: z.string().optional() })).mutation(({ input, ctx }) => transferCash(input, ctx.user.id)),
  }),
  network: router({ status: publicProcedure.query(() => getNetworkStatus()), heartbeat: publicProcedure.input(z.object({ page: z.string().max(80) })).query(({ input, ctx }) => { recordNetworkClient(ctx.req.ip ?? ctx.req.socket.remoteAddress, input.page); return { success: true }; }) }),
});

export type AppRouter = typeof appRouter;
