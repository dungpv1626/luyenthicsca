#!/usr/bin/env node
// Tiếng Trung: bộ kiểm tra trùng của generate-questions so khung tiếng Việt ("Chọn từ thích hợp điền vào chỗ trống…") nên báo "gần giống" sai.
// Script này đo lại độ giống CHỈ trên chữ Hán (bigram) giữa câu bị gắn cờ và câu "similar_to"; câu khác hẳn (< ngưỡng) được công bố
// (status approved, auto_published = true, chờ giáo viên xác nhận như mọi câu AI khác). Câu thực sự giống vẫn nằm ở hàng chờ duyệt.
//   node --env-file=.env.local scripts/release-flagged-zh.mjs --dry        # chỉ thống kê
//   node --env-file=.env.local scripts/release-flagged-zh.mjs              # công bố
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const TH = Number(process.argv[process.argv.indexOf("--threshold") + 1]) || 0.45;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const han = (s) => (String(s ?? "").match(/[一-鿿]/g) ?? []).join("");
const bigrams = (s) => { const t = han(s), o = new Set(); for (let i = 0; i + 1 < t.length; i++) o.add(t.slice(i, i + 2)); return o; };
const jac = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };

const { data: flagged } = await sb.from("questions").select("id, body, options, similar_to, verify_note").eq("subject", "chinese").eq("status", "review").eq("verify_status", "pass").like("verify_note", "Gần giống%").limit(1000);
// So với TOÀN BỘ câu Tiếng Trung khác (kể cả cùng lô: khi giống câu cùng lô thì similar_to rỗng nên không thể chỉ tin similar_to).
const { data: all } = await sb.from("questions").select("id, body, options").eq("subject", "chinese").neq("status", "rejected").limit(3000);
const text = (r) => `${r.body} ${Object.values(r.options ?? {}).join(" ")}`;
const bg = new Map((all ?? []).map((r) => [r.id, bigrams(text(r))]));
const release = [], keep = [];
for (const r of flagged ?? []) {
  const mine = bg.get(r.id) ?? bigrams(text(r)); let s = 0;
  for (const [id, other] of bg) if (id !== r.id) s = Math.max(s, jac(mine, other));
  (s < TH ? release : keep).push({ id: r.id, s });
}
console.log(`Bị gắn cờ: ${(flagged ?? []).length} · khác hẳn về chữ Hán (< ${TH}): ${release.length} → công bố · thực sự giống: ${keep.length} → giữ ở hàng chờ duyệt`);
if (keep.length) console.log("Độ giống các câu giữ lại:", keep.map((k) => k.s.toFixed(2)).join(" "));
if (!DRY && release.length) {
  for (let i = 0; i < release.length; i += 100) {
    const { error } = await sb.from("questions").update({ status: "approved", auto_published: true, review_note: "Công bố tự động (AI kiểm tra đạt; cờ 'gần giống' được đo lại trên chữ Hán và không đúng), chờ giáo viên xác nhận", verify_note: null, similar_to: null }).in("id", release.slice(i, i + 100).map((x) => x.id));
    if (error) throw error;
  }
  console.log(`Đã công bố ${release.length} câu.`);
}
