import { adminDb } from "@/lib/supabase/admin";
import { vnd } from "@/lib/constants";

export default async function Page() {
  const db = adminDb();
  const count = async (t: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = db.from(t).select("*", { count: "exact", head: true });
    return (await (f ? f(q) : q)).count ?? 0;
  };
  const [users, qs, approved, attempts, paidOrders, paid] = await Promise.all([
    count("profiles"), count("questions"), count("questions", (q) => q.eq("status", "approved")),
    count("attempts", (q) => q.not("submitted_at", "is", null)), count("orders", (q) => q.eq("status", "paid")),
    db.from("orders").select("amount_vnd").eq("status", "paid"),
  ]);
  const revenue = (paid.data ?? []).reduce((s, o) => s + o.amount_vnd, 0);
  const cards = [["Người dùng", users], ["Câu hỏi (đã duyệt/tổng)", `${approved}/${qs}`], ["Bài thi đã nộp", attempts], ["Đơn đã thanh toán", paidOrders], ["Doanh thu", vnd(revenue)]];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map(([l, v]) => <div key={l as string} className="card"><p className="text-sm text-stone-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>)}
      </div>
    </div>
  );
}
