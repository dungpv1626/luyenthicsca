import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { RESOURCES } from "@/lib/admin-resources";
import { deleteResource, saveResource } from "../../../actions";

export default async function Page({ params, searchParams }: { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { resource, id } = await params;
  const { error } = await searchParams;
  const r = RESOURCES[resource];
  if (!r) notFound();
  await requireAdmin(r.area);
  const db = adminDb();
  const isNew = id === "new";
  if (!isNew && !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: row } = isNew ? { data: null } : await db.from(r.table).select("*").eq("id", id).maybeSingle();
  if (!isNew && !row) notFound();
  const refs: Record<string, { id: string; label: string }[]> = {};
  for (const f of r.fields) if (f.type === "ref" && f.ref) {
    const { data } = await db.from(f.ref.table).select(`id, ${f.ref.label}`).order(f.ref.label);
    refs[f.name] = (data ?? []).map((x) => ({ id: (x as unknown as Record<string, string>).id, label: (x as unknown as Record<string, string>)[f.ref!.label] }));
  }
  const val = (n: string) => (row ? (row as Record<string, unknown>)[n] : undefined);
  return (
    <div className="max-w-2xl space-y-4">
      <form action={saveResource.bind(null, resource, isNew ? null : id)} className="card space-y-4">
        <h1 className="text-xl font-bold">{isNew ? "Thêm" : "Sửa"} {r.title.toLowerCase()}</h1>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">Vui lòng kiểm tra lại các trường bắt buộc.</p>}
        {r.fields.map((f) => (
          <div key={f.name}>
            {f.type !== "checkbox" && <label className="label">{f.label}{f.required && " *"}</label>}
            {f.type === "textarea" ? <textarea name={f.name} rows={4} defaultValue={(val(f.name) as string) ?? ""} className="input" />
              : f.type === "checkbox" ? <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name={f.name} defaultChecked={isNew ? ["is_active", "csca_required"].includes(f.name) : !!val(f.name)} />{f.label}</label>
              : f.type === "select" ? <select name={f.name} defaultValue={(val(f.name) as string) ?? ""} className="input">{Object.entries(f.options ?? {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              : f.type === "ref" ? <select name={f.name} defaultValue={(val(f.name) as string) ?? ""} className="input" required={f.required}><option value="">—</option>{refs[f.name]?.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
              : f.type === "tags" ? <input name={f.name} defaultValue={((val(f.name) as string[]) ?? []).join(", ")} className="input" />
              : <input name={f.name} type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} min={f.min} max={f.max} defaultValue={(val(f.name) as string | number) ?? (f.type === "number" && !f.nullable ? 0 : "")} required={f.required} className="input" />}
            {f.help && <p className="mt-1 text-xs text-stone-500">{f.help}</p>}
          </div>
        ))}
        <button className="btn">Lưu</button>
      </form>
      {!isNew && <form action={deleteResource.bind(null, resource, id)}><button className="text-sm font-semibold text-red-700 hover:underline">Xóa mục này</button></form>}
    </div>
  );
}
