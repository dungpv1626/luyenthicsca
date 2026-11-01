import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, STATUS_LABEL, SUBJECTS, type Subject } from "@/lib/constants";
import { setQuestionStatus } from "../actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; subject?: string }> }) {
  const me = await requireAdmin("questions");
  const { status, subject } = await searchParams;
  let q = adminDb().from("questions").select("id, subject, topic, difficulty, body, status").order("created_at", { ascending: false }).limit(200);
  if (status) q = q.eq("status", status);
  if (subject) q = q.eq("subject", subject);
  const { data } = await q;
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Question Bank</h1><Link href="/admin/questions/new" className="btn">+ Câu hỏi mới</Link></div>
      <form className="flex gap-2 text-sm">
        <select name="subject" defaultValue={subject ?? ""} className="input w-auto"><option value="">Mọi môn</option>{Object.entries(SUBJECTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select name="status" defaultValue={status ?? ""} className="input w-auto"><option value="">Mọi trạng thái</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="btn-outline">Lọc</button>
      </form>
      <div className="card divide-y p-0">
        {data?.map((x) => (
          <div key={x.id} className="flex items-center gap-3 p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{x.body}</p>
              <p className="text-stone-500">{SUBJECTS[x.subject as Subject]} · {x.topic} · {DIFFICULTY[x.difficulty as keyof typeof DIFFICULTY]}</p>
            </div>
            <span className="rounded bg-stone-100 px-2 py-0.5">{STATUS_LABEL[x.status as keyof typeof STATUS_LABEL]}</span>
            {canApprove && x.status !== "approved" && <form action={setQuestionStatus.bind(null, x.id, "approved")}><button className="text-green-700 hover:underline">Duyệt</button></form>}
            {x.status === "draft" && <form action={setQuestionStatus.bind(null, x.id, "review")}><button className="text-amber-700 hover:underline">Gửi duyệt</button></form>}
            <Link href={`/admin/questions/${x.id}`} className="text-brand hover:underline">Sửa</Link>
          </div>
        ))}
        {!data?.length && <p className="p-4 text-stone-500">Chưa có câu hỏi.</p>}
      </div>
    </div>
  );
}
