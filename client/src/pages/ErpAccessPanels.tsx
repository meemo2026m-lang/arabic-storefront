import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type ErpPageId } from "@/lib/erp";
import { trpc } from "@/lib/trpc";
import { Search, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ManagedUser = {
  id: number;
  name: string | null;
  email: string | null;
  isActive: number;
  activeRoleId: number | null;
  activeRoleName: string | null;
};

type ManagedRole = { id: number; name: string };
type ManagedPermission = { id: number; module: string; label: string; code: string };

export function UsersAndPermissions({ initialView }: { initialView: "users" | "permissions" }) {
  const requestedDialog = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("dialog") : null;
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [permissionOpen, setPermissionOpen] = useState(initialView === "permissions" || requestedDialog === "permissions");
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const usersQuery = trpc.access.users.useQuery();
  const rolesQuery = trpc.access.roles.useQuery();
  const permissionsQuery = trpc.access.permissions.useQuery();
  const utils = trpc.useUtils();
  const refreshUsers = () => utils.access.users.invalidate();
  const assignRole = trpc.access.assignRole.useMutation({ onSuccess: () => { refreshUsers(); toast.success("تم تحديث دور المستخدم"); }, onError: () => toast.error("يلزم الدخول كمشرف لتعديل الدور") });
  const setPermission = trpc.access.setPermission.useMutation({ onSuccess: () => toast.success("تم حفظ إعداد الصلاحية"), onError: () => toast.error("يلزم الدخول كمشرف لتعديل الصلاحية") });
  const createUser = trpc.access.createUser.useMutation({ onSuccess: () => { refreshUsers(); setNewName(""); setNewEmail(""); toast.success("تم إنشاء المستخدم"); }, onError: () => toast.error("يلزم الدخول كمشرف لإنشاء مستخدم") });
  const updateUser = trpc.access.updateUser.useMutation({ onSuccess: () => { refreshUsers(); setEditingUser(null); toast.success("تم حفظ بيانات المستخدم"); }, onError: () => toast.error("يلزم الدخول كمشرف لحفظ التعديل") });
  const users = (usersQuery.data ?? []) as ManagedUser[];
  const roles = (rolesQuery.data ?? []) as ManagedRole[];
  const permissions = (permissionsQuery.data ?? []) as ManagedPermission[];
  const selectedUser = users.find(user => user.id === selectedUserId) ?? users[0];
  const groupedPermissions = permissions.reduce<Record<string, ManagedPermission[]>>((groups, permission) => { (groups[permission.module] ??= []).push(permission); return groups; }, {});

  useEffect(() => { if (!selectedUserId && users[0]) setSelectedUserId(users[0].id); }, [selectedUserId, users]);
  useEffect(() => { if (requestedDialog === "edit" && users[0] && !editingUser) setEditingUser(users[0]); }, [editingUser, requestedDialog, users]);

  function openPermissions(user: ManagedUser) { setSelectedUserId(user.id); setPermissionOpen(true); }
  function toggleActive(user: ManagedUser) { updateUser.mutate({ userId: user.id, name: user.name || "مستخدم النظام", email: user.email || undefined, isActive: !Boolean(user.isActive) }); }

  return <section className="access-page"><div className="users-layout"><section className="erp-panel"><div className="panel-title"><span><Users size={16} />قائمة المستخدمين</span><span className="users-count">{users.length} مستخدمين</span></div><p className="admin-hint">تحتاج الإضافة والتعديل وتغيير الصلاحيات إلى تسجيل الدخول بحساب مدير النظام.</p><table className="erp-table records-table"><thead><tr><th>المستخدم</th><th>البريد الإلكتروني</th><th>الدور</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{usersQuery.isLoading ? <tr><td colSpan={5}>جارٍ تحميل المستخدمين...</td></tr> : users.map(user => <tr key={user.id}><td><strong>{user.name ?? "بدون اسم"}</strong></td><td>{user.email ?? "—"}</td><td><select className="table-select" value={user.activeRoleId ?? ""} onChange={event => assignRole.mutate({ userId: user.id, roleId: Number(event.target.value) })}>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></td><td><button type="button" className={user.isActive ? "status-chip status-chip--available status-toggle" : "status-chip status-chip--warning status-toggle"} onClick={() => toggleActive(user)}>{user.isActive ? "نشط" : "موقوف"}</button></td><td><div className="row-actions"><button onClick={() => setEditingUser(user)}>تعديل</button><button onClick={() => openPermissions(user)}>الصلاحيات</button></div></td></tr>)}</tbody></table><div className="mobile-user-cards">{users.map(user => <article className="mobile-user-card" key={user.id}><div><strong>{user.name ?? "بدون اسم"}</strong><small>{user.email ?? "—"}</small></div><label>الدور<select value={user.activeRoleId ?? ""} onChange={event => assignRole.mutate({ userId: user.id, roleId: Number(event.target.value) })}>{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><div className="mobile-user-card__actions"><button type="button" className={user.isActive ? "status-chip status-chip--available status-toggle" : "status-chip status-chip--warning status-toggle"} onClick={() => toggleActive(user)}>{user.isActive ? "نشط" : "موقوف"}</button><button type="button" className="table-detail" onClick={() => setEditingUser(user)}>تعديل</button><button type="button" className="table-detail" onClick={() => openPermissions(user)}>الصلاحيات</button></div></article>)}</div></section><section className="erp-panel add-user"><div className="panel-title"><span><Users size={16} />إضافة مستخدم جديد</span></div><label>الاسم الكامل<input value={newName} onChange={event => setNewName(event.target.value)} placeholder="اسم المستخدم" /></label><label>البريد الإلكتروني<input value={newEmail} onChange={event => setNewEmail(event.target.value)} placeholder="name@example.com" /></label><label>الدور الافتراضي<select id="new-user-role">{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><button type="button" className="erp-button erp-button--green" disabled={!newName || !roles[0]} onClick={() => { const roleId = Number((document.getElementById("new-user-role") as HTMLSelectElement | null)?.value ?? roles[0]?.id); if (roleId) createUser.mutate({ name: newName, email: newEmail || undefined, roleId }); }}>إضافة المستخدم</button></section></div><PermissionDialog open={permissionOpen} onOpenChange={setPermissionOpen} user={selectedUser} users={users} permissions={groupedPermissions} onUserChange={setSelectedUserId} onToggle={(permissionId, isAllowed) => selectedUser && setPermission.mutate({ userId: selectedUser.id, permissionId, isAllowed })} /><UserEditDialog user={editingUser} open={Boolean(editingUser)} onOpenChange={open => { if (!open) setEditingUser(null); }} onSave={input => updateUser.mutate(input)} /></section>;
}

function PermissionDialog({ open, onOpenChange, user, users, permissions, onUserChange, onToggle }: { open: boolean; onOpenChange: (open: boolean) => void; user: ManagedUser | undefined; users: ManagedUser[]; permissions: Record<string, ManagedPermission[]>; onUserChange: (id: number) => void; onToggle: (permissionId: number, isAllowed: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="permission-dialog" dir="rtl"><DialogHeader><DialogTitle><ShieldCheck size={18} /> تخصيص صلاحيات المستخدم</DialogTitle><DialogDescription>تفعيل أو إيقاف صلاحيات الوحدات للمستخدم المحدد.</DialogDescription></DialogHeader><div className="permission-head"><div><strong>{user?.name ?? "جارٍ التحميل"}</strong><p>{user?.email ?? ""}</p></div><select value={user?.id ?? ""} onChange={event => onUserChange(Number(event.target.value))}>{users.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="permission-groups">{Object.entries(permissions).map(([module, items]) => <section key={module} className="permission-group"><h3>{module}</h3>{items.map(permission => <label key={permission.id} className="permission-toggle"><span><strong>{permission.label}</strong><small>{permission.code}</small></span><input type="checkbox" defaultChecked onChange={event => onToggle(permission.id, event.target.checked)} /><i /></label>)}</section>)}</div></DialogContent></Dialog>;
}

function UserEditDialog({ user, open, onOpenChange, onSave }: { user: ManagedUser | null; open: boolean; onOpenChange: (open: boolean) => void; onSave: (input: { userId: number; name: string; email?: string; isActive: boolean }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  useEffect(() => { if (user) { setName(user.name || ""); setEmail(user.email || ""); setIsActive(Boolean(user.isActive)); } }, [user]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="user-edit-dialog" dir="rtl"><DialogHeader><DialogTitle>تعديل بيانات المستخدم</DialogTitle><DialogDescription>حدّث الاسم أو البريد الإلكتروني أو حالة التفعيل.</DialogDescription></DialogHeader><label>الاسم الكامل<input value={name} onChange={event => setName(event.target.value)} /></label><label>البريد الإلكتروني<input value={email} onChange={event => setEmail(event.target.value)} /></label><label className="dialog-active"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} /> الحساب نشط</label><button type="button" className="erp-button erp-button--green" disabled={!user || !name} onClick={() => user && onSave({ userId: user.id, name, email: email || undefined, isActive })}>حفظ التعديل</button></DialogContent></Dialog>;
}

const shortcutGroups: Array<{ title: string; actions: Array<[string, ErpPageId, string]> }> = [
  { title: "المبيعات والعملاء", actions: [["شاشة البيع السريعة", "pos", "فتح فاتورة مبيعات جديدة"], ["سجل فواتير المبيعات", "invoices", "استعراض الفواتير والأرشيف"], ["إدارة العملاء", "customers", "بيانات العملاء والحركات"]] },
  { title: "المخزون والمشتريات", actions: [["مراقبة المخزون", "inventory", "متابعة أرصدة الأصناف"], ["دليل المنتجات", "products", "إدارة المنتجات والخدمات"], ["إدارة الموردين", "suppliers", "موردون ومشتريات"]] },
  { title: "المالية والإعدادات", actions: [["الخزن والبنوك", "treasury", "الأرصدة والنقدية"], ["المستخدمون والصلاحيات", "users", "إدارة حسابات النظام"]] },
];

export function QuickShortcuts({ onNavigate }: { onNavigate: (page: ErpPageId) => void }) {
  const [filter, setFilter] = useState("");
  return <section className="quick-page erp-panel"><div className="quick-page__head"><div><h2>صفحة الاختصارات السريعة</h2><p>الوصول المباشر إلى أكثر عمليات النظام استخداماً.</p></div><label className="wide-search"><Search size={14} /><input value={filter} onChange={event => setFilter(event.target.value)} placeholder="ابحث في الاختصارات..." /></label></div><div className="shortcut-groups">{shortcutGroups.map(group => { const actions = group.actions.filter(([label]) => label.includes(filter)); return actions.length ? <section key={group.title} className="shortcut-group"><h3>{group.title}</h3><div className="quick-page__grid">{actions.map(([label, page, description]) => <button key={page} type="button" className="quick-page__action" onClick={() => onNavigate(page)}><span className="quick-page__icon"><Users size={20} /></span><strong>{label}</strong><small>{description}</small></button>)}</div></section> : null; })}</div></section>;
}
