#!/usr/bin/env node
// Thống kê trạng thái của một lô sinh câu (theo batch_id) hoặc của các câu mới nhất của một môn.
//   node --env-file=.env.local scripts/batch-status.mjs --subject chinese --since 2026-11-13T08:00
import { createClient } from "@supabase/supabase-js";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : process.argv[i + 1]; };
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let q = sb.from("questions").select("id, status, verify_status, verify_note, similar_to, batch_id, subtopic, created_at").gte("created_at", arg("since", "2026-01-01")).limit(2000);
if (arg("subject", null)) q = q.eq("subject", arg("subject", null));
const { data } = await q;
const g = {}; for (const r of data) { const note = (r.verify_note ?? "").includes("Gần giống") ? "gần giống" : r.verify_note ? "ghi chú khác" : "không ghi chú"; const k = `${r.status} / ${r.verify_status} / ${note}`; g[k] = (g[k] ?? 0) + 1; }
console.log(`Tổng ${data.length} câu:`); for (const [k, n] of Object.entries(g).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(5), k);

if (process.argv.includes("--by-subtopic")) {
  const t = {}; for (const r of data) t[r.subtopic ?? "(không có)"] = (t[r.subtopic ?? "(không có)"] ?? 0) + 1;
  console.log("\nTheo chủ đề con:"); for (const [k, n] of Object.entries(t).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(5), k);
}
