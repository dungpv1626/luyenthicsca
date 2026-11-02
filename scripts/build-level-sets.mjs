#!/usr/bin/env node
// Dựng bộ đề theo cấp từ các câu đang công bố (status = 'approved'), dùng đúng thuật toán lắp đề của admin
// (src/lib/assemble.ts): đúng cơ cấu độ khó, dàn đều chủ đề, KHÔNG trùng câu giữa các đề cùng cấp/phạm vi/môn.
//
//   node --env-file=.env.local scripts/build-level-sets.mjs --dry      # xem trước, không ghi
//   node --env-file=.env.local scripts/build-level-sets.mjs            # tạo đề
// Tùy chọn: --subject-sets 5 (số đề theo môn tối đa mỗi cấp) --full-sets 3 --publish-levels 1,2
import { createClient } from "@supabase/supabase-js";
import { buildSets } from "../src/lib/assemble.ts";
import { LEVELS, SET_DEFAULTS } from "../src/lib/levels.ts";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]; };
const DRY = !!arg("dry", false);
const SUBJECT_SETS = Number(arg("subject-sets", 5)), FULL_SETS = Number(arg("full-sets", 3));
const PUBLISH_LEVELS = String(arg("publish-levels", "1")).split(",").map(Number); // mặc định chỉ công bố Cấp 1 (miễn phí)
const SUBJECTS = ["math", "physics", "chemistry", "chinese"];
const VI = { math: "Toán", physics: "Vật lý", chemistry: "Hóa học", chinese: "Professional Chinese" };

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function fetchAll(build) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

// chỉ dùng câu đang công bố VÀ đủ 3 ngôn ngữ (đề đồng nhất, đổi ngôn ngữ được trong phòng thi)
const qs = await fetchAll(() => sb.from("questions").select("id, subject, topic, difficulty").eq("status", "approved").contains("translations", { en: {}, zh: {} }).order("id"));
const pools = {};
for (const q of qs) (pools[q.subject] ??= []).push(q);
console.log("Nguyên liệu (đang công bố, đủ 3 ngôn ngữ):", SUBJECTS.map((s) => `${VI[s]} ${pools[s]?.length ?? 0}`).join(" · "));

const { data: existing } = await sb.from("tests").select("id").not("level", "is", null).limit(1);
if (existing?.length && !arg("force", false)) { console.error("Đã có đề theo cấp. Dùng --force nếu muốn tạo thêm."); process.exit(1); }

const plan = []; // {level, scope, subject, sets}
for (const info of LEVELS) {
  for (const s of SUBJECTS) {
    const r = buildSets(pools, [s], SUBJECT_SETS, SET_DEFAULTS.subject.perSubject, info.mix, new Set(), { relaxed: false });
    plan.push({ info, scope: "subject", subject: s, want: SUBJECT_SETS, perSubject: SET_DEFAULTS.subject.perSubject, minutes: SET_DEFAULTS.subject.minutes, sets: r.sets, shortages: r.shortages });
  }
  const rf = buildSets(pools, SUBJECTS, FULL_SETS, SET_DEFAULTS.full.perSubject, info.mix, new Set(), { relaxed: false });
  plan.push({ info, scope: "full", subject: null, want: FULL_SETS, perSubject: SET_DEFAULTS.full.perSubject, minutes: SET_DEFAULTS.full.minutes, sets: rf.sets, shortages: rf.shortages });
}

console.log("\nKế hoạch (đề tạo được / mong muốn):");
for (const info of LEVELS) {
  const row = plan.filter((p) => p.info.level === info.level);
  console.log(`  Cấp ${info.level} ${info.name.padEnd(13)} ` + row.map((p) => `${p.scope === "full" ? "Tổng hợp" : VI[p.subject]} ${p.sets.length}/${p.want}`).join(" · "));
}
const total = plan.reduce((t, p) => t + p.sets.length, 0);
console.log(`Tổng: ${total} đề. Công bố ngay: Cấp ${PUBLISH_LEVELS.join(", ")}; các cấp còn lại tạo ở trạng thái ẨN.`);
if (DRY) { console.log("(--dry: chưa ghi gì)"); process.exit(0); }

let created = 0;
for (const p of plan) {
  let no = 0;
  for (const set of p.sets) {
    no++;
    const title = `Cấp ${p.info.level} · ${p.info.name} · ${p.scope === "full" ? "Tổng hợp" : VI[p.subject]} · Đề ${no}`;
    const publish = PUBLISH_LEVELS.includes(p.info.level);
    const { data: t, error } = await sb.from("tests").insert({
      title, kind: "mock", level: p.info.level, scope: p.scope, subject: p.subject, set_no: no,
      duration_min: p.minutes, price_vnd: p.info.price, is_published: publish,
      description: `${set.ids.length} câu · ${p.info.tagline}.`,
    }).select("id").single();
    if (error) { console.error("✗", title, error.message); continue; }
    const { error: e2 } = await sb.from("test_questions").insert(set.ids.map((question_id, i) => ({ test_id: t.id, question_id, position: i })));
    if (e2) { console.error("✗ test_questions", title, e2.message); await sb.from("tests").delete().eq("id", t.id); continue; }
    created++;
  }
}
console.log(`\nĐã tạo ${created}/${total} đề.`);
