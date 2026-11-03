#!/usr/bin/env node
// Nhập bài SEO từ content/seo/posts.json vào bảng posts, mặc định ở trạng thái NHÁP.
//   python3 scripts/seo_docx_to_json.py                         # (khi docx thay đổi) tạo lại posts.json
//   node --env-file=.env.local scripts/import-seo-posts.mjs     # nhập các bài chưa có (không ghi đè bài đã chỉnh sửa)
//   node --env-file=.env.local scripts/import-seo-posts.mjs --force   # ghi đè nội dung bài đã có theo posts.json (mất chỉnh sửa trong admin)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const FORCE = process.argv.includes("--force");
const posts = JSON.parse(readFileSync(new URL("../content/seo/posts.json", import.meta.url), "utf8"));
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: have } = await sb.from("posts").select("slug");
const exists = new Set((have ?? []).map((p) => p.slug));
let added = 0, updated = 0, skipped = 0;
for (const p of posts) {
  if (exists.has(p.slug)) {
    if (!FORCE) { skipped++; continue; }
    const { error } = await sb.from("posts").update({ ...p, updated_at: new Date().toISOString() }).eq("slug", p.slug);
    if (error) throw new Error(`${p.slug}: ${error.message}`); updated++;
  } else {
    const { error } = await sb.from("posts").insert({ ...p, status: "draft" });
    if (error) throw new Error(`${p.slug}: ${error.message}`); added++;
  }
}
console.log(`Thêm mới ${added} · cập nhật ${updated} · bỏ qua (đã có) ${skipped} · tổng trong tệp ${posts.length}`);
