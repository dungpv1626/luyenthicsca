"use client";
import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { AUDIENCES } from "@/lib/constants";
import { Logo } from "./Logo";
import { resendConfirmationAction } from "@/app/actions";

type State = { error?: string; pending?: string; unconfirmed?: string; values?: Record<string, string> } | undefined;
type Action = (prev: State, fd: FormData) => Promise<State | void>;

/** Nút gửi lại email xác nhận, có đếm ngược 60 giây để tránh gửi liên tục. */
function ResendBox({ email }: { email: string }) {
  const [wait, setWait] = useState(60);
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(t); }, [wait]);
  return (
    <div className="space-y-2">
      <button type="button" className="btn-outline w-full" disabled={busy || wait > 0} onClick={async () => { setBusy(true); const r = await resendConfirmationAction(email); setMsg(r); setBusy(false); setWait(60); }}>{busy ? "Đang gửi…" : wait > 0 ? `Gửi lại email (${wait}s)` : "Gửi lại email xác nhận"}</button>
      {msg && <p role="status" className={`rounded-lg p-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{msg.message}</p>}
    </div>
  );
}

export function AuthForm({ mode, action, next, audience }: { mode: "login" | "register"; action: Action; next: string; audience?: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (p, fd) => (await action(p, fd)) ?? undefined, undefined);
  const v = state?.values ?? {};
  const reg = mode === "register";
  if (state?.pending) return (
    <div className="card mx-auto max-w-md space-y-4 !p-7 text-center shadow-soft" role="status">
      <Logo vertical className="!w-24" />
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden="true">✉</span>
      <h1 className="text-2xl font-extrabold text-navy">Kiểm tra email của bạn</h1>
      <p className="text-slate-600">Chúng tôi đã gửi email xác nhận tới <b className="break-all text-ink">{state.pending}</b>. Bấm vào liên kết trong email để kích hoạt tài khoản.</p>
      <ul className="space-y-1 rounded-xl bg-mist p-3 text-left text-sm text-slate-600"><li>• Email có thể mất 1–2 phút mới tới.</li><li>• Hãy xem cả mục <b>Spam</b> hoặc <b>Quảng cáo</b> (người gửi: no-reply@luyenthicsca.edu.vn).</li><li>• Nhập sai email? Quay lại và đăng ký lại bằng email đúng.</li></ul>
      <ResendBox email={state.pending} />
      <Link className="inline-block py-2.5 text-sm font-semibold text-brand" href={`/dang-nhap?next=${encodeURIComponent(next)}`}>Đã xác nhận? Đăng nhập</Link>
    </div>
  );
  return (
    <form action={formAction} className="card mx-auto max-w-md space-y-4 !p-7 shadow-soft">
      <Logo vertical className="!w-28" />
      <h1 className="text-center text-2xl font-extrabold">{reg ? "Đăng ký tài khoản" : "Đăng nhập"}</h1>
      <input type="hidden" name="next" value={next} />
      {reg && (
        <>
          <div><label className="label" htmlFor="f-full-name">Họ và tên</label><input id="f-full-name" name="full_name" required defaultValue={v.full_name} className="input" /></div>
          <div><label className="label" htmlFor="f-phone">Số điện thoại</label><input id="f-phone" name="phone" defaultValue={v.phone} className="input" /></div>
          <div>
            <label className="label" htmlFor="f-audience">Bạn là</label>
            <select id="f-audience" name="audience" className="input" defaultValue={v.audience || audience || ""}>
              <option value="">— Chọn —</option>
              {Object.entries(AUDIENCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="label" htmlFor="f-target">Mục tiêu (vd: Đại học Trung Quốc)</label><input id="f-target" name="target" defaultValue={v.target} className="input" /></div>
          <div><label className="label" htmlFor="f-exam-date">Kỳ thi dự kiến</label><input id="f-exam-date" type="date" name="exam_date" defaultValue={v.exam_date} className="input" /></div>
        </>
      )}
      <div><label className="label" htmlFor="f-email">Email</label><input id="f-email" type="email" name="email" required defaultValue={v.email} className="input" /></div>
      <div><label className="label" htmlFor="f-password">Mật khẩu</label><input id="f-password" type="password" name="password" required minLength={reg ? 8 : 1} autoComplete={reg ? "new-password" : "current-password"} className="input" />{!reg && <Link href="/quen-mat-khau" className="mt-1 inline-flex min-h-[2.75rem] items-center text-sm font-semibold text-brand hover:underline">Quên mật khẩu?</Link>}</div>
      {state?.error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">{state.error}</p>}
      {state?.unconfirmed && <ResendBox email={state.unconfirmed} />}
      <button disabled={pending} className="btn w-full">{pending ? "Đang xử lý…" : reg ? "Đăng ký" : "Đăng nhập"}</button>
      <p className="text-center text-sm text-slate-600">
        {reg ? <>Đã có tài khoản? <Link className="inline-block py-2.5 font-semibold text-brand" href={`/dang-nhap?next=${encodeURIComponent(next)}`}>Đăng nhập</Link></>
             : <>Chưa có tài khoản? <Link className="inline-block py-2.5 font-semibold text-brand" href={`/dang-ky?next=${encodeURIComponent(next)}`}>Đăng ký</Link></>}
      </p>
    </form>
  );
}
