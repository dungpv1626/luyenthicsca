#!/usr/bin/env node
// In N câu mới nhất (mặc định 8) kèm chuyên đề được phân loại, để giáo viên/người phụ trách đọc kiểm.
//   node --env-file=.env.local scripts/show-recent.mjs --n 16 --subject chemistry [--sample 12]  # --sample: lấy mẫu trải đều
import { createClient } from "@supabase/supabase-js";
import { classify } from "../src/lib/syllabus.ts";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]; };
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let q = sb.from("questions").select("subject, topic, subtopic, difficulty, body, options, correct_answer, explanation, status, created_at").order("created_at", { ascending: false }).limit(Number(arg("n", 8)));
if (arg("subject", null)) q = q.eq("subject", arg("subject", null));
const { data } = await q;
const all = (data ?? []).reverse(); const k = Number(arg("sample", 0)); const list = k ? all.filter((_, i) => i % Math.max(1, Math.floor(all.length / k)) === 0).slice(0, k) : all;
for (const r of list) {
  const c = classify(r);
  console.log(`\n[${c.module}/${c.topic ?? "-"}] ${r.subtopic} · ${r.difficulty} · ${r.status}`);
  console.log(r.body.replace(/\s+/g, " "));
  for (const k of ["A", "B", "C", "D"]) console.log(`  ${k === r.correct_answer ? "✔" : " "} ${k}. ${String(r.options[k]).replace(/\s+/g, " ")}`);
  console.log("  → " + r.explanation.replace(/\s+/g, " ").slice(0, 260));
}
