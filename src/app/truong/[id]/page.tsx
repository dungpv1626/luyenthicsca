import { notFound } from "next/navigation";
import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { getMe } from "@/lib/auth";
import { getSkillProfile } from "@/lib/skills";
import { PageHeader } from "@/components/Section";
import { SchoolPhoto } from "@/components/SchoolPhoto";
import { Icon } from "@/components/Icon";
import { consultAction } from "../../school-actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await adminDb().from("schools").select("name, name_zh").eq("id", id).maybeSingle();
  return { title: data ? `${data.name}${data.name_zh ? ` (${data.name_zh})` : ""}` : "Thông tin trường" };
}

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ consult?: string }> }) {
  const { id } = await params;
  const { consult } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = adminDb();
  const [{ data: s }, { data: sch }, me] = await Promise.all([
    db.from("schools").select("*").eq("id", id).maybeSingle(),
    db.from("scholarships").select("id, name, coverage, deadline").eq("school_id", id).eq("is_active", true),
    getMe(),
  ]);
  if (!s) notFound();
  const skills = me ? await getSkillProfile(me.id) : null;
  const reqs = [["Toán", "math", s.req_math], ["Vật lý", "physics", s.req_physics], ["Hóa học", "chemistry", s.req_chemistry], ["Professional Chinese", "chinese", s.req_chinese]] as const;
  const hasReq = reqs.some(([, , v]) => v !== null);

  return (
    <div className="space-y-6">
      {s.image_url && <div className="group mb-5 overflow-hidden rounded-2xl"><SchoolPhoto url={s.image_url} credit={s.image_credit} alt={s.name} className="h-48 sm:h-72" /></div>}
      <PageHeader en={s.name} vi={`${s.name_zh ?? ""} · ${s.city ?? ""}`}>{s.description}</PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card">
            <h2 className="mb-1 font-bold">Yêu cầu CSCA & đánh giá hồ sơ</h2>
            <p className="mb-4 text-sm text-muted">{s.requirement_note || "Mức chuẩn tham khảo (% số câu đúng)."}</p>
            {hasReq ? (
              <div className="space-y-3">
                {reqs.map(([label, key, v]) => {
                  const mine = skills && skills.bySubject[key as keyof typeof skills.bySubject].total ? skills.bySubject[key as keyof typeof skills.bySubject].pct : null;
                  if (v === null) return <div key={key} className="flex justify-between text-sm"><span>{label}</span><span className="text-muted">Đang cập nhật</span></div>;
                  const ok = mine !== null && mine >= v;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span>Chuẩn <b>{v}%</b>{mine !== null && <> · Bạn <b className={ok ? "text-emerald-600" : "text-red-600"}>{mine}%</b> {ok ? "✓" : `(thiếu ${v - mine}%)`}</>}</span></div>
                      <div className="relative mt-1 h-2.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${mine ?? 0}%` }} /><span className="absolute -top-1 h-4.5 w-0.5 bg-ink" style={{ left: `${v}%`, height: "1.1rem" }} title="Mức chuẩn" /></div>
                    </div>
                  );
                })}
                {!me && <p className="text-sm text-muted"><Link href={`/dang-nhap?next=/truong/${id}`} className="font-semibold text-brand">Đăng nhập</Link> để so sánh với năng lực của bạn.</p>}
                {me && skills && !skills.topics.length && <p className="text-sm text-muted">Làm <Link href="/quick-test" className="font-semibold text-brand">Quick Test</Link> để có dữ liệu so sánh.</p>}
              </div>
            ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Trường chưa có mức chuẩn CSCA. Đội ngũ đang cập nhật từ thông báo chính thức. Bạn có thể đăng ký tư vấn để được hỗ trợ.</p>}
          </section>

          {(s.majors as string[]).length > 0 && <section className="card"><h2 className="mb-3 font-bold">Ngành học</h2><div className="flex flex-wrap gap-2">{(s.majors as string[]).map((m) => <span key={m} className="chip">{m}</span>)}</div></section>}

          <section className="card"><h2 className="mb-3 font-bold">Học bổng liên quan</h2>
            {sch?.length ? <ul className="space-y-2">{sch.map((x) => <li key={x.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3"><Icon name="award" className="mt-0.5 h-5 w-5 text-brand" /><div><p className="font-semibold">{x.name}</p><p className="text-sm text-slate-600">{x.coverage}</p>{x.deadline && <p className="text-xs text-muted">Hạn: {new Date(x.deadline).toLocaleDateString("vi-VN")}</p>}</div></li>)}</ul> : <p className="text-sm text-muted">Chưa có học bổng gắn với trường này. Xem <Link href="/hoc-bong" className="font-semibold text-brand">tất cả học bổng</Link>.</p>}
          </section>
        </div>

        <aside id="tu-van" className="card h-fit lg:sticky lg:top-24">
          <h2 className="font-bold">Đăng ký tư vấn</h2>
          <p className="mb-3 text-sm text-muted">Tư vấn viên sẽ liên hệ về lộ trình, hồ sơ và học bổng cho {s.name}.</p>
          {consult === "ok" && <p className="mb-3 rounded-xl bg-success-bg p-3 text-sm text-emerald-800">Đã gửi yêu cầu. Chúng tôi sẽ liên hệ bạn sớm.</p>}
          {consult === "invalid" && <p className="mb-3 rounded-xl bg-warning-bg p-3 text-sm text-warning">Vui lòng nhập số điện thoại hợp lệ.</p>}
          {me ? (
            <form action={consultAction.bind(null, s.id)} className="space-y-3">
              <input name="phone" type="tel" required placeholder="Số điện thoại / Zalo" className="input" />
              <textarea name="message" rows={3} placeholder="Bạn cần tư vấn điều gì? (ngành, học bổng, thời gian…)" className="input" />
              <button className="btn w-full">Gửi yêu cầu tư vấn</button>
            </form>
          ) : <Link href={`/dang-nhap?next=/truong/${id}`} className="btn w-full">Đăng nhập để đăng ký tư vấn</Link>}
          {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center text-sm font-semibold text-brand hover:underline">Website chính thức ↗</a>}
        </aside>
      </div>
    </div>
  );
}
