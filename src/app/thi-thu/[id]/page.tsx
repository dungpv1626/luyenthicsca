import { notFound } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { canAccessTest } from "@/lib/exam";
import { vnd } from "@/lib/constants";
import { buyTestAction } from "../../order-actions";
import { startMockAction } from "../../exam-actions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = adminDb();
  const { data: t } = await db.from("tests").select("*").eq("id", id).eq("is_published", true).single();
  if (!t) notFound();
  const { count } = await db.from("test_questions").select("*", { count: "exact", head: true }).eq("test_id", id);
  const me = await getMe();
  const access = me ? await canAccessTest(me.id, t) : t.price_vnd === 0;

  return (
    <div className="card mx-auto max-w-xl space-y-3 !p-7 shadow-soft">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p className="text-stone-600">{t.description}</p>
      <ul className="text-sm text-stone-600"><li>{count ?? 0} câu hỏi</li><li>{t.duration_min} phút</li><li>Giá: <b className="text-ink">{vnd(t.price_vnd)}</b></li></ul>
      {!me ? (
        <Link href={`/dang-nhap?next=/thi-thu/${id}`} className="btn">Đăng nhập để làm bài</Link>
      ) : access ? (
        <form action={startMockAction.bind(null, id)}><button className="btn">Bắt đầu / tiếp tục làm bài</button></form>
      ) : (
        <form action={buyTestAction.bind(null, id)}><button className="btn">Mua đề – {vnd(t.price_vnd)}</button></form>
      )}
    </div>
  );
}
