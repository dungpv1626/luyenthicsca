#!/usr/bin/env node
// In số câu đang công bố theo từng chuyên đề của đề cương (kể cả Tiếng Trung theo khối), đánh dấu chuyên đề trống / ít.
//   node --env-file=.env.local scripts/topic-coverage.mjs [--min 30]
import { createClient } from "@supabase/supabase-js";
import { classify, TOPICS, zhTrackOf } from "../src/lib/syllabus.ts";

const min = Number(process.argv[process.argv.indexOf("--min") + 1]) || 30;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const rows = []; for (let f = 0; ; f += 1000) { const { data } = await sb.from("questions").select("subject, topic, subtopic").eq("status", "approved").range(f, f + 999); rows.push(...data); if (data.length < 1000) break; }
const c = {}; for (const r of rows) { const t = classify(r).topic; if (!t) continue; const k = r.subject === "chinese" ? `chinese.${t}.${zhTrackOf(r.subtopic)}` : `${r.subject}.${t}`; c[k] = (c[k] ?? 0) + 1; }
let empty = [], few = [];
for (const s of Object.keys(TOPICS)) for (const t of TOPICS[s]) {
  const parts = s === "chinese" ? [["khoa học", c[`chinese.${t.key}.science`] ?? 0], ["văn", c[`chinese.${t.key}.humanities`] ?? 0]] : [["", c[`${s}.${t.key}`] ?? 0]];
  for (const [tr, n] of parts) { const name = `${s}.${t.key}${tr ? " (" + tr + ")" : ""}`; if (!n) empty.push(name); else if (n < min) few.push(`${name}=${n}`); }
}
console.log(`Chuyên đề trống: ${empty.length}${empty.length ? " → " + empty.join(", ") : ""}`);
console.log(`Chuyên đề dưới ${min} câu: ${few.length}${few.length ? " → " + few.join(", ") : ""}`);
