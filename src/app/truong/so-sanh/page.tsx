import Link from "next/link";
import { adminDb } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/Section";

export const metadata = { title: "So sánh trường" };

export default async function Page({ searchParams }: { searchParams: Promise<{ ids?: string | string[] }> }) {
  const { ids } = await searchParams;
  const list = (Array.isArray(ids) ? ids : ids ? [ids] : []).filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 3);
  const db = adminDb();
  const [{ data: schools }, { data: sch }] = await Promise.all([
    list.length ? db.from("schools").select("*").in("id", list) : Promise.resolve({ data: [] as never[] }),
    db.from("scholarships").select("school_id").eq("is_active", true),
  ]);
  const cols = list.map((id) => schools?.find((s) => s.id === id)).filter(Boolean) as NonNullable<typeof schools>;
  const pct = (v: number | null) => (v === null ? <span className="text-slate-400">Đang cập nhật</span> : <b>{v}%</b>);
  const rows: [string, (s: (typeof cols)[number]) => React.ReactNode][] = [
    ["Thành phố", (s) => s.city ?? "—"], ["Loại hình", (s) => s.kind ?? "—"],
    ["Yêu cầu CSCA", (s) => (s.csca_required ? "Có" : "Không")],
    ["Toán", (s) => pct(s.req_math)], ["Vật lý", (s) => pct(s.req_physics)], ["Hóa học", (s) => pct(s.req_chemistry)], ["Professional Chinese", (s) => pct(s.req_chinese)],
    ["Ngành", (s) => ((s.majors as string[]).length ? (s.majors as string[]).join(", ") : "Đang cập nhật")],
    ["Học bổng liên kết", (s) => `${(sch ?? []).filter((x) => x.school_id === s.id).length} chương trình`],
    ["Website", (s) => (s.website ? <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-brand underline">Mở</a> : "—")],
  ];
  return (
    <div>
      <PageHeader en="Compare" vi="So sánh trường" />
      {cols.length < 2 ? (
        <div className="card text-center"><p>Hãy chọn ít nhất 2 trường để so sánh.</p><Link href="/truong" className="btn mt-4">Chọn trường</Link></div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[32rem] text-sm">
            <thead><tr className="bg-brand-soft"><th className="p-4 text-left" />{cols.map((s) => <th key={s.id} className="p-4 text-left"><Link href={`/truong/${s.id}`} className="font-bold text-brand hover:underline">{s.name}</Link><div className="text-xs font-normal text-slate-500">{s.name_zh}</div></th>)}</tr></thead>
            <tbody>{rows.map(([label, f]) => <tr key={label} className="border-t border-slate-100"><th className="p-4 text-left font-semibold text-slate-500">{label}</th>{cols.map((s) => <td key={s.id} className="p-4">{f(s)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">Mức chuẩn là % số câu đúng tham khảo do đội ngũ tổng hợp, không phải điểm CSCA chính thức. Luôn đối chiếu thông báo tuyển sinh của trường.</p>
    </div>
  );
}
