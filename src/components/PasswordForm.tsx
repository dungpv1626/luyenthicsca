"use client";
import { useActionState, useState } from "react";

type State = { error?: string; ok?: string } | undefined;
type Field = { name: string; label: string; type?: "email" | "password"; autoComplete?: string };

export function PasswordForm({ title, intro, fields, action, submit, footer }: {
  title: string; intro?: string; fields: Field[]; action: (prev: State, fd: FormData) => Promise<State>; submit: string; footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [show, setShow] = useState(false);
  const hasPw = fields.some((f) => f.type !== "email");
  return (
    <form action={formAction} className="card mx-auto max-w-md space-y-4 !p-7 shadow-soft">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      {intro && <p className="text-sm text-slate-600">{intro}</p>}
      {fields.map((f) => (
        <div key={f.name}>
          <label className="label" htmlFor={f.name}>{f.label}</label>
          <input id={f.name} name={f.name} type={f.type === "email" ? "email" : show ? "text" : "password"} autoComplete={f.autoComplete} required className="input" />
        </div>
      ))}
      {hasPw && <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />Hiện mật khẩu</label>}
      {state?.error && <p role="alert" className="rounded-lg bg-danger-bg p-2.5 text-sm text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-success-bg p-2.5 text-sm text-emerald-800">{state.ok}</p>}
      <button disabled={pending} className="btn w-full">{pending ? "Đang xử lý…" : submit}</button>
      {footer && <div className="text-center text-sm text-slate-600">{footer}</div>}
    </form>
  );
}
