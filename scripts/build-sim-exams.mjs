#!/usr/bin/env node
// Dựng ĐỀ MÔ PHỎNG CSCA theo từng môn: Toán/Lý/Hóa 48 câu · 60 phút; Professional Chinese 80 câu · 90 phút.
// Dùng câu đang công bố có đủ 3 ngôn ngữ; các đề mô phỏng KHÔNG trùng câu với nhau. Đề 01 mỗi môn miễn phí và công bố;
// các đề sau tạo ở trạng thái ẨN (giá 49.000đ) chờ giáo viên duyệt mẫu.
//   node --env-file=.env.local scripts/build-sim-exams.mjs --dry
//   node --env-file=.env.local scripts/build-sim-exams.mjs --math 8 --physics 8 --chemistry 6 --chinese 3
import { createClient } from "@supabase/supabase-js";
import { buildSets } from "../src/lib/assemble.ts";
import { SIM_FORMAT, SIM_MIX } from "../src/lib/sim.ts";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]; };
const DRY = !!arg("dry", false);
const WANT = { math: Number(arg("math", 8)), physics: Number(arg("physics", 8)), chemistry: Number(arg("chemistry", 6)), chinese: Number(arg("chinese", 3)) };
const VI = { math: "Toán", physics: "Vật lý", chemistry: "Hóa học", chinese: "Professional Chinese" };
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fetchAll(build) { const out = []; for (let from = 0; ; from += 1000) { const { data, error } = await build().range(from, from + 999); if (error) throw new Error(error.message); out.push(...data); if (data.length < 1000) break; } return out; }
const qs = await fetchAll(() => sb.from("questions").select("id, subject, topic, difficulty, origin").eq("status", "approved").contains("translations", { en: {}, zh: {} }).order("id"));
// Câu sinh từ khuôn tham số rất nhiều nhưng na ná nhau: chỉ đưa vào tối đa ½ số câu không-từ-khuôn của môn đó để đề đa dạng
const shuf = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pools = {};
for (const s of Object.keys(SIM_FORMAT)) {
  const all = qs.filter((q) => q.subject === s), plain = all.filter((q) => q.origin !== "template"), tpl = shuf(all.filter((q) => q.origin === "template"));
  pools[s] = [...plain, ...tpl.slice(0, Math.floor(plain.length * 0.5))];
}

const { data: have } = await sb.from("tests").select("subject, set_no").eq("sim", true);
const next = Object.fromEntries(Object.keys(SIM_FORMAT).map((s) => [s, Math.max(0, ...(have ?? []).filter((t) => t.subject === s).map((t) => t.set_no ?? 0))]));

const plan = [];
for (const s of Object.keys(SIM_FORMAT)) {
  const f = SIM_FORMAT[s], pool = pools[s] ?? [];
  const by = { easy: 0, medium: 0, hard: 0 }; for (const q of pool) by[q.difficulty]++;
  // thử số đề muốn có; nếu thiếu câu theo cơ cấu thì giảm dần
  let n = WANT[s], r;
  for (; n > 0; n--) { r = buildSets({ [s]: pool }, [s], n, f.questions, SIM_MIX, new Set(), { relaxed: false }); if (r.sets.length === n) break; }
  plan.push({ s, f, pool: pool.length, by, want: WANT[s], got: n, sets: n > 0 ? r.sets : [] });
}
console.log("Câu đủ 3 ngôn ngữ đang công bố: " + Object.keys(SIM_FORMAT).map((s) => `${VI[s]} ${pools[s]?.length ?? 0} (dễ ${plan.find((p) => p.s === s).by.easy}/TB ${plan.find((p) => p.s === s).by.medium}/khó ${plan.find((p) => p.s === s).by.hard})`).join(" · "));
for (const p of plan) console.log(`  ${VI[p.s].padEnd(22)} ${p.f.questions} câu/${p.f.minutes}′ · muốn ${p.want} đề · dựng được ${p.got} đề không trùng câu${p.got < p.want ? "  ← THIẾU câu theo cơ cấu " + Object.entries({ dễ: 30, TB: 50, khó: 20 }).map(([k, v]) => `${k} ${v}%`).join("/") : ""}`);
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
      description: `${p.f.questions} câu · ${p.f.minutes} phút · chấm thang 100. Số câu và thời gian theo khuôn đề thi thật; cơ cấu độ khó do chúng tôi ước lượng.`,
    }).select("id").single();
    if (error) { console.error("✗", title, error.message); continue; }
    const { error: e2 } = await sb.from("test_questions").insert(set.ids.map((question_id, i) => ({ test_id: t.id, question_id, position: i })));
    if (e2) { console.error("✗ test_questions", title, e2.message); await sb.from("tests").delete().eq("id", t.id); continue; }
    created++;
  }
}
console.log(`Đã tạo ${created} đề mô phỏng. Đề 01 mỗi môn: miễn phí, ĐÃ công bố. Các đề còn lại: ẨN, 49.000đ.`);
