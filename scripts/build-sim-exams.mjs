#!/usr/bin/env node
// Dựng ĐỀ MÔ PHỎNG CSCA theo từng môn: Toán/Lý/Hóa 48 câu · 60 phút; Professional Chinese 80 câu · 90 phút.
// Mỗi đề lắp theo HẠN NGẠCH MÔ-ĐUN của đề cương (src/lib/syllabus.ts; tỉ trọng là ước lượng vì đề cương không công bố số câu/mô-đun).
// Dùng câu đang công bố có đủ 3 ngôn ngữ; các đề mô phỏng KHÔNG trùng câu với nhau. Đề 01 mỗi môn miễn phí và công bố;
// các đề sau tạo ở trạng thái ẨN (giá 49.000đ) chờ giáo viên duyệt mẫu.
//   node --env-file=.env.local scripts/build-sim-exams.mjs --dry
//   node --env-file=.env.local scripts/build-sim-exams.mjs --replace   # xóa các đề mô phỏng CHƯA có lượt làm rồi dựng lại
//   node --env-file=.env.local scripts/build-sim-exams.mjs --math 8 --physics 8 --chemistry 6 --chinese 3
import { createClient } from "@supabase/supabase-js";
import { buildModuleSets } from "../src/lib/assemble-modules.ts";
import { MODULES, moduleQuotas } from "../src/lib/syllabus.ts";
import { SIM_FORMAT, SIM_MIX } from "../src/lib/sim.ts";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]; };
const DRY = !!arg("dry", false), REPLACE = !!arg("replace", false), MAX_SHIFT = Number(arg("max-shift", 2)); // số câu tối đa lệch khỏi hạn ngạch mô-đun trong một đề
const WANT = { math: Number(arg("math", 8)), physics: Number(arg("physics", 8)), chemistry: Number(arg("chemistry", 6)), chinese: Number(arg("chinese", 3)) };
const VI = { math: "Toán", physics: "Vật lý", chemistry: "Hóa học", chinese: "Professional Chinese" };
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fetchAll(build) { const out = []; for (let from = 0; ; from += 1000) { const { data, error } = await build().range(from, from + 999); if (error) throw new Error(error.message); out.push(...data); if (data.length < 1000) break; } return out; }
const qs = await fetchAll(() => sb.from("questions").select("id, subject, topic, difficulty, origin, module, template_key").eq("status", "approved").contains("translations", { en: {}, zh: {} }).order("id"));
// Chỉ dùng câu thuộc một mô-đun của đề cương (bỏ câu "ngoài phần liệt kê" và chưa phân loại).
// Câu sinh từ khuôn tham số rất nhiều nhưng na ná nhau: mỗi KHUÔN chỉ đưa vào tối đa --per-template câu (mặc định 8) để đề có nhiều dạng bài khác nhau.
const PER_TEMPLATE = Number(arg("per-template", 8));
const shuf = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pools = {};
for (const s of Object.keys(SIM_FORMAT)) {
  pools[s] = [];
  for (const m of MODULES[s]) {
    const all = qs.filter((q) => q.subject === s && q.module === m.key), plain = all.filter((q) => q.origin !== "template");
    const byKey = new Map(); for (const q of all.filter((q) => q.origin === "template")) (byKey.get(q.template_key ?? "?") ?? byKey.set(q.template_key ?? "?", []).get(q.template_key ?? "?")).push(q);
    pools[s].push(...plain, ...[...byKey.values()].flatMap((list) => shuf(list).slice(0, PER_TEMPLATE)));
  }
}

if (REPLACE && !DRY) {
  const { data: old } = await sb.from("tests").select("id").eq("sim", true);
  let removed = 0, kept = 0;
  for (const t of old ?? []) {
    const { count } = await sb.from("attempts").select("*", { count: "exact", head: true }).eq("test_id", t.id);
    if (count) { kept++; continue; }
    await sb.from("test_questions").delete().eq("test_id", t.id); await sb.from("tests").delete().eq("id", t.id); removed++;
  }
  console.log(`Đã xóa ${removed} đề mô phỏng cũ (giữ ${kept} đề đã có lượt làm).`);
}
const { data: have } = await sb.from("tests").select("subject, set_no").eq("sim", true);
const next = Object.fromEntries(Object.keys(SIM_FORMAT).map((s) => [s, Math.max(0, ...(have ?? []).filter((t) => t.subject === s).map((t) => t.set_no ?? 0))]));

const plan = [];
for (const s of Object.keys(SIM_FORMAT)) {
  const f = SIM_FORMAT[s], pool = pools[s] ?? [], quotas = moduleQuotas(s, f.questions);
  const by = { easy: 0, medium: 0, hard: 0 }; for (const q of pool) by[q.difficulty]++;
  const sets = buildModuleSets(pool, quotas, WANT[s], SIM_MIX, Math.random, MAX_SHIFT);
  plan.push({ s, f, pool: pool.length, by, want: WANT[s], got: sets.length, sets, quotas });
}
console.log("Câu đủ 3 ngôn ngữ đang công bố: " + Object.keys(SIM_FORMAT).map((s) => `${VI[s]} ${pools[s]?.length ?? 0} (dễ ${plan.find((p) => p.s === s).by.easy}/TB ${plan.find((p) => p.s === s).by.medium}/khó ${plan.find((p) => p.s === s).by.hard})`).join(" · "));
for (const p of plan) {
  console.log(`  ${VI[p.s].padEnd(22)} ${p.f.questions} câu/${p.f.minutes}′ · muốn ${p.want} đề · dựng được ${p.got} đề không trùng câu${p.got < p.want ? "  ← THIẾU câu theo mô-đun/độ khó" : ""}`);
  console.log("     hạn ngạch: " + MODULES[p.s].map((m) => `${m.name} ${p.quotas[m.key]}`).join(" · "));
  const short = p.sets.filter((x) => x.redistributed > 0); if (short.length) console.log(`     ⚠ ${short.length}/${p.got} đề phải bù câu từ mô-đun khác: ` + [...new Set(short.flatMap((x) => Object.keys(x.shortfall)))].map((k) => MODULES[p.s].find((m) => m.key === k)?.name).join(", "));
}
if (DRY) { console.log("(--dry: chưa ghi)"); process.exit(0); }

let created = 0;
for (const p of plan) {
  let no = next[p.s];
  for (const set of p.sets) {
    no++;
    const title = `Đề mô phỏng CSCA · ${VI[p.s]} · Đề ${String(no).padStart(2, "0")}`;
    const free = no === 1;
    const { data: t, error } = await sb.from("tests").insert({
      title, kind: "mock", sim: true, level: null, scope: "subject", subject: p.s, set_no: no, duration_min: p.f.minutes,
      price_vnd: free ? 0 : 49000, is_published: free,
      description: `${p.f.questions} câu · ${p.f.minutes} phút · chấm thang 100. Số câu và thời gian theo khuôn đề thi thật; chia theo các mô-đun của đề cương (tỉ trọng và độ khó do chúng tôi ước lượng).`,
    }).select("id").single();
    if (error) { console.error("✗", title, error.message); continue; }
    const { error: e2 } = await sb.from("test_questions").insert(set.ids.map((question_id, i) => ({ test_id: t.id, question_id, position: i })));
    if (e2) { console.error("✗ test_questions", title, e2.message); await sb.from("tests").delete().eq("id", t.id); continue; }
    created++;
  }
}
console.log(`Đã tạo ${created} đề mô phỏng. Đề 01 mỗi môn: miễn phí, ĐÃ công bố. Các đề còn lại: ẨN, 49.000đ.`);
