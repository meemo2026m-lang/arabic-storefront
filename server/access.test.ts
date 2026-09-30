import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./access", () => ({
  createAccessUser: vi.fn(),
  listAccessPermissions: vi.fn(),
  listAccessRoles: vi.fn(),
  listAccessUsers: vi.fn(),
  setUserPermission: vi.fn(),
  setUserRole: vi.fn(),
  updateAccessUser: vi.fn(),
}));

import { createAccessUser, listAccessPermissions, listAccessRoles, listAccessUsers, updateAccessUser } from "./access";
import { appRouter } from "./routers";

const publicContext = { user: null } as unknown as TrpcContext;
const adminContext = {
  user: {
    id: 1,
    openId: "admin-user",
    name: "مدير النظام",
    email: "admin@example.com",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
} as unknown as TrpcContext;

describe("ERP access router", () => {
  it("returns public user, role, and permission management data", async () => {
    vi.mocked(listAccessUsers).mockResolvedValue([]);
    vi.mocked(listAccessRoles).mockResolvedValue([]);
    vi.mocked(listAccessPermissions).mockResolvedValue([]);
    const caller = appRouter.createCaller(publicContext);

    await expect(caller.access.users()).resolves.toEqual([]);
    await expect(caller.access.roles()).resolves.toEqual([]);
    await expect(caller.access.permissions()).resolves.toEqual([]);
  });

  it("allows a system administrator to create a managed ERP user", async () => {
    vi.mocked(createAccessUser).mockResolvedValue({ userId: 99 });
    const result = await appRouter.createCaller(adminContext).access.createUser({ name: "مستخدم جديد", email: "new@example.com", roleId: 1 });

    expect(result).toEqual({ userId: 99 });
    expect(createAccessUser).toHaveBeenCalledWith({ name: "مستخدم جديد", email: "new@example.com", roleId: 1 });
  });

  it("allows a system administrator to edit user details and activation state", async () => {
    vi.mocked(updateAccessUser).mockResolvedValue(undefined);
    const result = await appRouter.createCaller(adminContext).access.updateUser({ userId: 7, name: "مستخدم محدث", email: "updated@example.com", isActive: false });

    expect(result).toBeUndefined();
    expect(updateAccessUser).toHaveBeenCalledWith({ userId: 7, name: "مستخدم محدث", email: "updated@example.com", isActive: false });
  });
});
