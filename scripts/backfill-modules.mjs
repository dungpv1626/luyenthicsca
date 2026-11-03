#!/usr/bin/env node
// Gán mô-đun đề cương (questions.module) cho mọi câu theo quy tắc trong src/lib/syllabus.ts và in bảng phủ đề cương.
//   node --env-file=.env.local scripts/backfill-modules.mjs        # ghi vào DB
//   node --env-file=.env.local scripts/backfill-modules.mjs --dry  # chỉ in
import { createClient } from "@supabase/supabase-js";
import { MODULES, moduleOf, moduleName, moduleQuotas } from "../src/lib/syllabus.ts";

const DRY = process.argv.includes("--dry");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function fetchAll(build) { const out = []; for (let from = 0; ; from += 1000) { const { data, error } = await build().range(from, from + 999); if (error) throw new Error(error.message); out.push(...data); if (data.length < 1000) break; } return out; }

const qs = await fetchAll(() => sb.from("questions").select("id, subject, topic, subtopic, module, status").order("id"));
const want = new Map(); // "môn|mô-đun" -> [id]
let changed = 0;
for (const q of qs) {
  const m = moduleOf(q);
  if ((q.module ?? null) !== m) { changed++; const k = `${q.subject}|${m ?? ""}`; (want.get(k) ?? want.set(k, []).get(k)).push(q.id); }
}
console.log(`Tổng ${qs.length} câu · cần cập nhật ${changed}`);
if (!DRY) for (const [k, ids] of want) {
  const m = k.split("|")[1] || null;
  for (let i = 0; i < ids.length; i += 150) { const { error } = await sb.from("questions").update({ module: m }).in("id", ids.slice(i, i + 150)); if (error) throw new Error(error.message); }
}
// bảng phủ đề cương theo câu đang công bố
const live = qs.filter((q) => q.status === "approved");
console.log("\nPHỦ ĐỀ CƯƠNG (câu đang công bố):");
for (const s of Object.keys(MODULES)) {
  const sub = live.filter((q) => q.subject === s), n = s === "chinese" ? 80 : 48, quota = moduleQuotas(s, n);
  console.log(`\n${s} — ${sub.length} câu`);
  for (const m of MODULES[s]) { const c = sub.filter((q) => moduleOf(q) === m.key).length; console.log(`  ${m.name.padEnd(40)} tỉ trọng ${String(m.weight).padStart(2)}% (${String(quota[m.key]).padStart(2)} câu/đề) · có ${String(c).padStart(4)} câu (${Math.round((c / sub.length) * 100)}%) ${c < quota[m.key] * 6 ? " ← ít" : ""}`); }
  const out = sub.filter((q) => moduleOf(q) === "out").length, unk = sub.filter((q) => moduleOf(q) === null).length;
  if (out || unk) console.log(`  ${"(ngoài phần liệt kê / chưa phân loại)".padEnd(40)} ${out} ngoài · ${unk} chưa phân loại`);
}
