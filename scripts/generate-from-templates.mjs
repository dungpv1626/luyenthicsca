#!/usr/bin/env node
// Sinh câu hỏi từ KHUÔN THAM SỐ (src/lib/templates). Đáp án & đáp án nhiễu do MÃ tính — không gọi API, không tốn tiền.
//   node --env-file=.env.local scripts/generate-from-templates.mjs --dry            # xem số lượng sẽ tạo
//   node --env-file=.env.local scripts/generate-from-templates.mjs --show math.calc.deriv_cubic   # in thử 1 biến thể (vi/en/zh)
//   node --env-file=.env.local scripts/generate-from-templates.mjs --publish        # tạo & công bố ngay (chờ giáo viên duyệt khuôn)
// Tùy chọn: --max-per 100 (tối đa/khuôn) · --small-cap 8 (khuôn ít biến thể thì chỉ lấy ngần này) · --subject math · --template <key>
import { moduleOf } from "../src/lib/syllabus.ts";
import { createClient } from "@supabase/supabase-js";
import { TEMPLATES, mkRng, seedFor, validateVariant, LANGS } from "../src/lib/templates/index.ts";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); if (i < 0) return d; const v = process.argv[i + 1]; return v === undefined || v.startsWith("--") ? true : v; };
const DRY = !!arg("dry", false), PUBLISH = !!arg("publish", false);
const MAX_PER = Number(arg("max-per", 100)), SMALL_CAP = Number(arg("small-cap", 8)), SMALL_LIMIT = 50;
const ONLY_SUBJECT = arg("subject", null), ONLY_KEY = arg("template", null), SHOW = arg("show", null);
const BATCH = `t-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`;

if (SHOW) {
  const t = TEMPLATES.find((x) => x.key === SHOW); if (!t) { console.error("Không có khuôn", SHOW); process.exit(1); }
  for (let i = 0, shown = 0; shown < Number(arg("n", 1)) && i < 200; i++) { const v = t.build(mkRng(seedFor(t.key, i))); if (!v) continue; shown++;
    for (const l of LANGS) console.log(`[${l}] ${v[l].body}\n   A. ${v[l].opts[0]}  (đúng)\n   B. ${v[l].opts[1]}\n   C. ${v[l].opts[2]}\n   D. ${v[l].opts[3]}\n   → ${v[l].steps}\n`); }
  process.exit(0);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function fetchAll(build) { const out = []; for (let from = 0; ; from += 1000) { const { data, error } = await build().range(from, from + 999); if (error) throw new Error(error.message); out.push(...data); if (data.length < 1000) break; } return out; }

const existing = await fetchAll(() => sb.from("questions").select("id, template_key, body").not("template_key", "is", null).order("id"));
const have = new Map(); // key → Set(body)
for (const q of existing) (have.get(q.template_key) ?? have.set(q.template_key, new Set()).get(q.template_key)).add(q.body);

const rows = []; const report = [];
for (const t of TEMPLATES) {
  if (ONLY_SUBJECT && t.subject !== ONLY_SUBJECT) continue; if (ONLY_KEY && t.key !== ONLY_KEY) continue;
  // 1) đo số biến thể duy nhất khả dĩ (3000 hạt giống)
  const uniq = new Map();
  for (let i = 0; i < 3000; i++) { const v = t.build(mkRng(seedFor(t.key, i))); if (!v || validateVariant(v)) continue; if (!uniq.has(v.vi.body)) uniq.set(v.vi.body, { v, i }); }
  // khuôn ít biến thể (<50) chỉ lấy vài câu; còn lại tối đa ½ số biến thể duy nhất để tránh đề na ná nhau
  const cap = uniq.size < SMALL_LIMIT ? Math.min(uniq.size, SMALL_CAP) : Math.min(MAX_PER, Math.max(20, Math.floor(uniq.size / 2)));
  const seen = have.get(t.key) ?? new Set(); let added = 0;
  for (const [body, { v, i }] of uniq) {
    if (seen.size + added >= cap) break; if (seen.has(body)) continue;
    const perm = (() => { const a = [0, 1, 2, 3], r = mkRng(seedFor(t.key, i) ^ 0x5bd1e995); for (let k = 3; k > 0; k--) { const j = r.int(0, k); [a[k], a[j]] = [a[j], a[k]]; } return a; })(); // perm[pos] = chỉ số đáp án gốc
    const L = "ABCD", correct = L[perm.indexOf(0)];
    const pack = (l) => ({ body: v[l].body, options: Object.fromEntries(perm.map((o, pos) => [L[pos], v[l].opts[o]])), explanation: v[l].steps });
    const vi = pack("vi"), en = pack("en"), zh = pack("zh");
    rows.push({
      subject: t.subject, topic: t.topic, subtopic: t.subtopic, module: moduleOf(t), difficulty: t.difficulty, language: "vi",
      body: vi.body, options: vi.options, correct_answer: correct, explanation: vi.explanation,
      translations: { en, zh }, skill: v.skill.slice(0, 80), est_time_sec: v.est,
      source: `Khuôn tham số ${t.key} – đáp án tính bằng mã, chờ giáo viên duyệt khuôn`,
      origin: "template", template_key: t.key, params: { seed: seedFor(t.key, i) }, batch_id: BATCH,
      verify_status: "pass", verify_note: null,
      ...(PUBLISH ? { status: "approved", auto_published: true, review_note: "Công bố tự động (đáp án tính bằng mã), chờ giáo viên duyệt khuôn" } : { status: "review", auto_published: false }),
    });
    added++;
  }
  report.push([t.key, t.subject, t.difficulty, uniq.size, cap, added]);
}
console.log("khuôn".padEnd(34), "môn".padEnd(10), "độ khó".padEnd(7), "duy nhất", "chỉ tiêu", "thêm mới");
for (const r of report) console.log(String(r[0]).padEnd(34), String(r[1]).padEnd(10), String(r[2]).padEnd(7), String(r[3]).padStart(8), String(r[4]).padStart(8), String(r[5]).padStart(8));
const by = {}; for (const r of rows) { const k = `${r.subject}/${r.difficulty}`; by[k] = (by[k] ?? 0) + 1; }
console.log(`\nTổng sẽ thêm: ${rows.length} câu`, by, DRY ? "(--dry: chưa ghi)" : "");
if (DRY || !rows.length) process.exit(0);

// bảng duyệt khuôn: tạo bản ghi 'pending' nếu chưa có
await sb.from("template_reviews").upsert([...new Set(rows.map((r) => r.template_key))].map((template_key) => ({ template_key })), { onConflict: "template_key", ignoreDuplicates: true });
let saved = 0;
for (let i = 0; i < rows.length; i += 200) { const { data, error } = await sb.from("questions").insert(rows.slice(i, i + 200)).select("id"); if (error) throw new Error(error.message); saved += data.length; }
console.log(`Đã lưu ${saved} câu (lô ${BATCH}), trạng thái: ${PUBLISH ? "ĐÃ CÔNG BỐ" : "chờ duyệt"}.`);
