import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { RESOURCES } from "@/lib/admin-resources";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  return { title: `${RESOURCES[resource]?.title ?? "Dữ liệu"} – Quản trị` };
}

export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const r = RESOURCES[resource];
  if (!r) notFound();
  await requireAdmin(r.area);
  const { data } = await adminDb().from(r.table).select("*").order("created_at", { ascending: false }).limit(300);
  const label = (name: string) => r.fields.find((f) => f.name === name)?.label ?? name;
  const show = (v: unknown) => (typeof v === "boolean" ? (v ? "✓" : "—") : v === null || v === undefined || v === "" ? "—" : String(v));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">{r.title}</h1><Link href={`/admin/data/${resource}/new`} className="btn">+ Thêm</Link></div>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left">{r.columns.map((c) => <th key={c} className="p-3 font-semibold">{label(c)}</th>)}<th /></tr></thead>
          <tbody>{(data ?? []).map((row) => <tr key={row.id} className="border-t border-slate-100">{r.columns.map((c) => <td key={c} className="p-3">{show(row[c])}</td>)}<td className="p-3 text-right"><Link href={`/admin/data/${resource}/${row.id}`} className="inline-block rounded-lg px-2.5 py-2 font-semibold text-brand hover:bg-brand-soft">Sửa</Link></td></tr>)}</tbody></table>
        {!data?.length && <p className="p-5 text-muted">Chưa có dữ liệu.</p>}
      </div>
    </div>
  );
}
