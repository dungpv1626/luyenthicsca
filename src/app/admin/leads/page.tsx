import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { AUDIENCES } from "@/lib/constants";
import { setLeadStatus } from "../actions";

const ST = { new: "Mới", contacted: "Đã liên hệ", closed: "Đã đóng" } as const;

export default async function Page() {
  await requireAdmin("leads");
  const { data } = await adminDb().from("consultations").select("*, profiles(full_name, audience, target), schools(name)").order("created_at", { ascending: false }).limit(300);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tư vấn / Leads</h1>
      <div className="card divide-y p-0">
        {data?.map((c) => {
          const p = c.profiles as unknown as { full_name: string; audience: string | null; target: string | null } | null;
          const s = c.schools as unknown as { name: string } | null;
          return (
            <div key={c.id} className="flex flex-wrap items-start gap-3 p-4 text-sm">
              <div className="min-w-0 flex-1"><p className="font-semibold">{p?.full_name || "(chưa có tên)"} · <a href={`tel:${c.phone}`} className="text-brand">{c.phone}</a></p>
                <p className="text-slate-500">{AUDIENCES[p?.audience as keyof typeof AUDIENCES] ?? "—"} · Mục tiêu: {p?.target ?? "—"} · Quan tâm: {s?.name ?? "chung"}</p>
                {c.message && <p className="mt-1 text-slate-700">“{c.message}”</p>}<p className="mt-1 text-xs text-slate-400">{new Date(c.created_at).toLocaleString("vi-VN")}</p></div>
              <span className={`chip ${c.status === "new" ? "" : "!bg-slate-100 !text-slate-500"}`}>{ST[c.status as keyof typeof ST]}</span>
              <div className="flex gap-2">{(["contacted", "closed"] as const).filter((x) => x !== c.status).map((x) => <form key={x} action={setLeadStatus.bind(null, c.id, x)}><button className="font-semibold text-brand hover:underline">{ST[x]}</button></form>)}</div>
            </div>
          );
        })}
        {!data?.length && <p className="p-5 text-slate-500">Chưa có yêu cầu tư vấn.</p>}
      </div>
    </div>
  );
}
