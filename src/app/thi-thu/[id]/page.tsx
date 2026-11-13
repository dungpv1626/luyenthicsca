import { notFound } from "next/navigation";
import { SubmitButton } from "@/components/SubmitButton";
import Link from "next/link";
import { getMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { canAccessTest } from "@/lib/exam";
import { DIFFICULTY, SUBJECTS, type Subject } from "@/lib/constants";
import { LEVELS, mixText } from "@/lib/levels";
import { SIM_FORMAT, SIM_MIX, secondsPerQuestion, score100 } from "@/lib/sim";
import { MODULES, type Subject as SylSubject } from "@/lib/syllabus";
import type { Breakdown } from "@/lib/scoring";
import { startMockAction } from "../../exam-actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await adminDb().from("tests").select("title").eq("id", id).eq("is_published", true).maybeSingle();
  return { title: data?.title ?? "Chi tiết đề thi thử" };
}

const fmtDate = (d: string) => new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = adminDb();
  const { data: t } = await db.from("tests").select("*").eq("id", id).eq("is_published", true).single();
  if (!t) notFound();
  const me = await getMe();
  const [{ data: tq }, access, { data: hist }] = await Promise.all([
    db.from("test_questions").select("questions(subject, difficulty, module)").eq("test_id", id),
    me ? canAccessTest(me.id, t) : Promise.resolve(t.price_vnd === 0),
    me ? db.from("attempts").select("id, started_at, submitted_at, duration_sec, score, readiness, breakdown").eq("user_id", me.id).eq("test_id", id).order("started_at", { ascending: false }).limit(8) : Promise.resolve({ data: [] }),
  ]);
  const qs = (tq ?? []).map((r) => r.questions as unknown as { subject: string; difficulty: string; module: string | null } | null).filter(Boolean) as { subject: string; difficulty: string; module: string | null }[];
  const bySub: Record<string, number> = {}, byDiff: Record<string, number> = {};
  const byMod: Record<string, number> = {};
  for (const q of qs) { bySub[q.subject] = (bySub[q.subject] ?? 0) + 1; byDiff[q.difficulty] = (byDiff[q.difficulty] ?? 0) + 1; if (q.module) byMod[q.module] = (byMod[q.module] ?? 0) + 1; }
  const level = LEVELS.find((l) => l.level === t.level);
  const open = (hist ?? []).find((a) => !a.submitted_at && Date.now() < new Date(a.started_at).getTime() + a.duration_sec * 1000);
  const leftSec = open ? Math.max(0, Math.round((new Date(open.started_at).getTime() + open.duration_sec * 1000 - Date.now()) / 1000)) : 0;
  const done = (hist ?? []).filter((a) => a.submitted_at);

  return (
    <div className="w-form grid gap-4">
      <div className="card space-y-4 !p-6 shadow-soft sm:!p-7">
        <div>
          <p className="eyebrow">{t.sim ? "Đề mô phỏng CSCA" : level ? `Mức ${level.level} · ${level.name}` : "Đề thi thử"}</p>
          <h1 className="work-title mt-1">{t.title}</h1>
          {t.description && <p className="mt-1 text-slate-600">{t.description}</p>}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-mist p-3"><dt className="text-xs text-muted">Số câu</dt><dd className="text-xl font-black text-navy">{qs.length}</dd></div>
          <div className="rounded-xl bg-mist p-3"><dt className="text-xs text-muted">Thời gian</dt><dd className="text-xl font-black text-navy">{t.duration_min}′</dd></div>
          <div className="rounded-xl bg-mist p-3"><dt className="text-xs text-muted">Giá</dt><dd className={`text-xl font-black ${t.price_vnd ? "text-navy" : "text-emerald-600"}`}>{t.price_vnd ? "Gói trả phí" : "Miễn phí"}</dd></div>
        </dl>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          {t.sim && t.subject && t.subject in MODULES
            ? <div><p className="font-bold">Cơ cấu theo mô-đun đề cương</p><ul className="mt-1.5 space-y-1">{MODULES[t.subject as SylSubject].filter((m) => byMod[m.key]).map((m) => <li key={m.key} className="flex justify-between gap-3 text-slate-600"><span>{m.name}</span><b className="shrink-0 text-ink">{byMod[m.key]} câu</b></li>)}</ul></div>
            : <div><p className="font-bold">Cơ cấu theo môn</p><ul className="mt-1.5 space-y-1">{Object.entries(bySub).map(([k, n]) => <li key={k} className="flex justify-between text-slate-600"><span>{SUBJECTS[k as Subject]?.split(" (")[0] ?? k}</span><b className="text-ink">{n} câu</b></li>)}</ul></div>}
          <div><p className="font-bold">Cơ cấu độ khó</p><ul className="mt-1.5 space-y-1">{(["easy", "medium", "hard"] as const).filter((k) => byDiff[k]).map((k) => <li key={k} className="flex justify-between text-slate-600"><span>{DIFFICULTY[k]}</span><b className="text-ink">{byDiff[k]} câu</b></li>)}</ul>{t.sim ? <p className="mt-1 text-xs text-muted">Cơ cấu ước lượng: {mixText(SIM_MIX)}</p> : level && <p className="mt-1 text-xs text-muted">Mục tiêu của mức: {mixText(level.mix)}</p>}</div>
        </div>

        {t.sim && t.subject && t.subject in SIM_FORMAT && (
          <p className="rounded-xl bg-brand-soft/60 p-3 text-sm text-slate-700"><b className="text-navy">Đúng khuôn đề thi thật:</b> {SIM_FORMAT[t.subject as keyof typeof SIM_FORMAT].questions} câu trắc nghiệm trong {SIM_FORMAT[t.subject as keyof typeof SIM_FORMAT].minutes} phút, trung bình khoảng {secondsPerQuestion(t.subject as keyof typeof SIM_FORMAT)} giây mỗi câu, chấm thang 100. Số câu và thời gian theo thông tin công bố của kỳ thi; các mô-đun theo đề cương nhưng tỉ trọng mỗi mô-đun và cơ cấu độ khó do chúng tôi ước lượng (đề cương không công bố số câu theo mô-đun); điểm quy đổi chỉ để tham khảo.</p>
        )}
        <div className="border-t border-slate-100 pt-4">
          {!me ? <Link href={`/dang-nhap?next=/thi-thu/${id}`} className="btn w-full sm:w-auto">Đăng nhập để làm bài</Link>
            : access ? <form action={startMockAction.bind(null, id)} className="flex flex-wrap items-center gap-3"><SubmitButton className="btn w-full sm:w-auto" pendingText="Đang mở bài thi…">{open ? "Tiếp tục làm bài" : done.some((a) => !(a.breakdown as Breakdown | null)?.insufficient) ? "Làm lại bài này" : "Bắt đầu làm bài"}</SubmitButton>{open && <p className="text-sm text-warning">Bạn đang làm dở, còn <b className="font-mono">{String(Math.floor(leftSec / 60)).padStart(2, "0")}:{String(leftSec % 60).padStart(2, "0")}</b>. Đồng hồ vẫn chạy.</p>}</form>
            : <div className="flex flex-wrap items-center gap-3"><Link href="/bang-gia" className="btn w-full sm:w-auto">Mở khóa bằng gói Starter hoặc Pro</Link><p className="text-sm text-muted">Một gói mở toàn bộ đề Mức 1–4 và đề mô phỏng trong 12 tháng.</p></div>}
        </div>
      </div>

      <div className="card !p-5">
        <h2 className="font-extrabold text-navy">Trước khi bắt đầu</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
          <li>Đồng hồ chạy ngay khi bạn bấm bắt đầu và <b>không dừng</b> nếu bạn thoát. Hết giờ, bài tự nộp.</li>
          <li>Đáp án được lưu tự động; bạn có thể tiếp tục trên thiết bị khác trong thời gian làm bài.</li>
          <li>Có thể đổi ngôn ngữ Việt – Anh – Trung và đánh dấu câu cần xem lại.</li>
          <li>Làm dưới 20% số câu thì bài không được chấm Readiness và không tính vào tiến bộ.</li>
          <li>Sau khi nộp bạn nhận điểm Readiness, phân tích AI và lời giải từng câu.</li>
        </ul>
      </div>

      {done.length > 0 && (
        <div className="card !p-5">
          <h2 className="font-extrabold text-navy">Lịch sử làm bài</h2>
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {done.map((a) => { const b = a.breakdown as Breakdown | null; return (
              <li key={a.id}><Link href={`/ket-qua/${a.id}`} className="flex min-h-[2.75rem] items-center justify-between gap-3 py-2 hover:text-brand-text"><span className="text-slate-600">{fmtDate(a.submitted_at!)}</span><span className="font-semibold">{b?.insufficient ? <span className="text-amber-700">Chưa đủ câu để chấm</span> : t.sim ? `Điểm quy đổi ${score100(a.score ?? 0, b?.total ?? qs.length)}/100 · đúng ${a.score ?? 0}/${b?.total ?? qs.length}` : `Readiness ${a.readiness ?? 0}/100 · đúng ${a.score ?? 0}/${b?.total ?? qs.length}`} →</span></Link></li>
            ); })}
          </ul>
        </div>
      )}
    </div>
  );
}
