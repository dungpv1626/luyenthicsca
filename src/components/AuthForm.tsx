"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AUDIENCES } from "@/lib/constants";

type State = { error?: string; values?: Record<string, string> } | undefined;
type Action = (prev: State, fd: FormData) => Promise<State | void>;

export function AuthForm({ mode, action, next, audience }: { mode: "login" | "register"; action: Action; next: string; audience?: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (p, fd) => (await action(p, fd)) ?? undefined, undefined);
  const v = state?.values ?? {};
  const reg = mode === "register";
  return (
    <form action={formAction} className="card mx-auto max-w-md space-y-4 !p-7 shadow-soft">
      <h1 className="text-2xl font-extrabold">{reg ? "Đăng ký tài khoản" : "Đăng nhập"}</h1>
      <input type="hidden" name="next" value={next} />
      {reg && (
        <>
          <div><label className="label">Họ và tên</label><input name="full_name" required defaultValue={v.full_name} className="input" /></div>
          <div><label className="label">Số điện thoại</label><input name="phone" defaultValue={v.phone} className="input" /></div>
          <div>
            <label className="label">Bạn là</label>
            <select name="audience" className="input" defaultValue={v.audience || audience || ""}>
              <option value="">— Chọn —</option>
              {Object.entries(AUDIENCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label">Mục tiêu (vd: Đại học Trung Quốc)</label><input name="target" defaultValue={v.target} className="input" /></div>
          <div><label className="label">Kỳ thi dự kiến</label><input type="date" name="exam_date" defaultValue={v.exam_date} className="input" /></div>
        </>
      )}
      <div><label className="label">Email</label><input type="email" name="email" required defaultValue={v.email} className="input" /></div>
      <div><label className="label">Mật khẩu</label><input type="password" name="password" required minLength={reg ? 8 : 1} autoComplete={reg ? "new-password" : "current-password"} className="input" />{!reg && <Link href="/quen-mat-khau" className="mt-1.5 inline-block text-xs font-semibold text-brand hover:underline">Quên mật khẩu?</Link>}</div>
      {state?.error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn w-full">{pending ? "Đang xử lý…" : reg ? "Đăng ký" : "Đăng nhập"}</button>
      <p className="text-center text-sm text-stone-600">
        {reg ? <>Đã có tài khoản? <Link className="text-brand" href={`/dang-nhap?next=${encodeURIComponent(next)}`}>Đăng nhập</Link></>
             : <>Chưa có tài khoản? <Link className="text-brand" href={`/dang-ky?next=${encodeURIComponent(next)}`}>Đăng ký</Link></>}
      </p>
    </form>
  );
}
