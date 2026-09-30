import { Building2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

export function ErpLogin() {
  const [email, setEmail] = useState("meemo2026m@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email, password }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "تعذر تسجيل الدخول.");
      window.location.assign("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تسجيل الدخول.");
    } finally {
      setPending(false);
    }
  };

  return <main className="erp-login" dir="rtl"><section className="erp-login__brand"><div className="erp-login__mark"><Building2 size={34} /></div><h1>ERP متجري</h1><p>إدارة المبيعات والمخزون والحسابات والفروع من مكان واحد.</p><div className="erp-login__features"><span><ShieldCheck size={16} /> صلاحيات وأدوار مؤمنة</span><span><KeyRound size={16} /> وصول آمن للحسابات</span></div></section><section className="erp-login__card"><div className="erp-login__icon"><LockKeyhole size={23} /></div><h2>تسجيل الدخول للنظام</h2><p>سجّل ببريد وكلمة مرور مستخدم Supabase المعتمد.</p><form className="erp-login__form" onSubmit={submit}><label>البريد الإلكتروني<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label><label>كلمة المرور<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>{message && <p className="erp-login__error">{message}</p>}<button type="submit" className="erp-login__button" disabled={pending}>{pending ? "جارٍ التحقق..." : "تسجيل الدخول"}</button></form><small>يُسمح فقط بالحساب المحدد في إعدادات الخادم.</small></section></main>;
}
