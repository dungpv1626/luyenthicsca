#!/usr/bin/env node
// Đối chiếu nhóm cũ (questions.module) với dạng câu mới gán, in mẫu các câu lệch nhóm để người phụ trách đọc kiểm.
//   node --env-file=.env.local scripts/show-zh-labels.mjs
import { createClient } from "@supabase/supabase-js";
import { classify } from "../src/lib/syllabus.ts";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data } = await sb.from("questions").select("topic, subtopic, module, body").eq("subject", "chinese").eq("status", "approved").limit(1000);
const cross = {}; for (const r of data) { const c = classify({ subject: "chinese", topic: r.topic, subtopic: r.subtopic }); const k = `${r.module} → ${c.module}`; cross[k] = (cross[k] ?? 0) + 1; }
console.log("nhóm cũ → nhóm theo dạng câu:", JSON.stringify(cross));
const pick = (from, to, n) => data.filter((r) => r.module === from && classify({ subject: "chinese", topic: r.topic, subtopic: r.subtopic }).module === to).slice(0, n);
for (const [from, to] of [["vocab", "reading"], ["grammar", "reading"], ["reading", "vocab"]]) {
  for (const r of pick(from, to, 3)) console.log(`\n[${from} → ${to}] ${r.subtopic}\n  ${r.body.replace(/\s+/g, " ").slice(0, 230)}`);
}
