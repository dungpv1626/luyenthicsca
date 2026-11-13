#!/usr/bin/env node
// Gán DẠNG CÂU chính thức (6 dạng của đề cương CSCA) và KHỐI (khoa học/văn) cho các câu Tiếng Trung chưa có nhãn.
// Nhãn được ghi vào questions.subtopic: "<dạng Hán> · khối khoa học|khối văn · <chủ đề con cũ>" (giữ lại chủ đề con cũ).
//   node --env-file=.env.local scripts/label-zh-types.mjs --dry        # chỉ in phân bố, không ghi
//   node --env-file=.env.local scripts/label-zh-types.mjs              # ghi vào DB
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const PRICE_IN = Number(process.env.PRICE_IN ?? 2), PRICE_OUT = Number(process.env.PRICE_OUT ?? 10);
const TOTAL_CAP = Number(process.env.AI_TOTAL_CAP_USD ?? 75);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const claude = new Anthropic();
const usage = { in: 0, out: 0, calls: 0 };

const TYPES = { "识解汉字": "zh_char", "选词填空": "zh_cloze", "辨析词语": "zh_diff", "选词成段": "zh_passage", "补全语句": "zh_sentence", "阅读理解": "zh_reading" };
const TOOL = {
  name: "label", description: "Nộp nhãn dạng câu và khối cho từng câu hỏi.",
  input_schema: { type: "object", properties: { labels: { type: "array", items: { type: "object", properties: {
    id: { type: "string" }, type: { type: "string", enum: Object.keys(TYPES) }, track: { type: "string", enum: ["khoa học", "văn"] },
  }, required: ["id", "type", "track"] } } }, required: ["labels"] },
};
const SYSTEM = `Bạn phân loại câu hỏi Tiếng Trung chuyên ngành của kỳ thi CSCA theo 6 DẠNG CÂU chính thức:
- 识解汉字: hỏi nghĩa/cấu tạo của một chữ Hán hoặc một từ/thuật ngữ, thường trích MỘT câu ngắn rồi hỏi nghĩa của từ (vd "từ X trong câu có nghĩa là", "X biểu thị điều gì"), kể cả khi đề mở đầu bằng "Đọc câu sau".
- 选词填空: một chỗ trống trong câu, chọn từ thích hợp điền vào.
- 辨析词语: phân biệt các từ gần nghĩa, chọn từ dùng đúng/sai trong ngữ cảnh.
- 选词成段: đoạn văn có nhiều chỗ trống (①②③…), chọn tổ hợp từ điền vào.
- 补全语句: chọn câu/vế câu thích hợp để hoàn thành đoạn, hoặc chọn câu có trật tự/cấu trúc đúng (ngữ pháp).
- 阅读理解: CHỈ khi có một đoạn văn từ 2 câu trở lên (kể cả hướng dẫn, mô tả thí nghiệm, biểu đồ, bảng số liệu) và câu hỏi về nội dung, ý chính, suy luận, thái độ tác giả hoặc số liệu. Nếu chỉ hỏi nghĩa một từ trong một câu thì KHÔNG phải 阅读理解.
Câu có kèm "nhom_cu" là nhóm phân loại cũ: "vocab" thường là 识解汉字/选词填空/辨析词语; "grammar" thường là 补全语句/选词成段; "reading" thường là 阅读理解. Chỉ chọn dạng khác nhóm cũ khi nội dung rõ ràng thuộc dạng khác.
Mỗi câu chọn ĐÚNG MỘT dạng gần nhất. Khối: "khoa học" nếu ngữ liệu thuộc toán/lý/hóa/thí nghiệm/kỹ thuật/số liệu; "văn" nếu thuộc văn học, triết học, luật, giáo dục, lịch sử, nghệ thuật. Trả bằng công cụ label, mỗi câu đúng một nhãn.`;

const rows = []; for (let f = 0; ; f += 1000) { const { data, error } = await sb.from("questions").select("id, topic, subtopic, module, body, options").eq("subject", "chinese").order("id").range(f, f + 999); if (error) throw error; rows.push(...data); if (data.length < 1000) break; }
const todo = rows.filter((r) => !Object.keys(TYPES).some((t) => (r.subtopic ?? "").includes(t)));
console.log(`Tiếng Trung: ${rows.length} câu · chưa có nhãn dạng câu: ${todo.length}`);
const { data: led } = await sb.from("ai_spend").select("usd"); const before = (led ?? []).reduce((s, r) => s + Number(r.usd), 0);
console.log(`Sổ chi tiêu: ≈ $${before.toFixed(2)} / $${TOTAL_CAP}`);

const text = (r) => `${r.body}\n${["A", "B", "C", "D"].map((k) => `${k}. ${r.options?.[k] ?? ""}`).join(" | ")}`.slice(0, 900);
const BATCH = 15, out = new Map();
for (let i = 0; i < todo.length; i += BATCH) {
  if (before + (usage.in * PRICE_IN + usage.out * PRICE_OUT) / 1e6 >= TOTAL_CAP - 1) { console.log("⛔ Gần chạm trần tổng, dừng."); break; }
  const part = todo.slice(i, i + BATCH);
  const r = await claude.messages.create({ model: MODEL, max_tokens: 3000, system: SYSTEM, tools: [TOOL],
    messages: [{ role: "user", content: JSON.stringify(part.map((q) => ({ id: q.id, topic: q.topic, nhom_cu: q.module, noi_dung: text(q) }))) }] });
  usage.calls++; usage.in += r.usage?.input_tokens ?? 0; usage.out += r.usage?.output_tokens ?? 0;
  let labels = r.content.find((c) => c.type === "tool_use")?.input?.labels ?? []; if (typeof labels === "string") { try { labels = JSON.parse(labels); } catch { labels = []; } }
  for (const l of labels) if (TYPES[l.type]) out.set(l.id, l);
}
const dist = {}; for (const l of out.values()) { const k = `${l.type} · ${l.track}`; dist[k] = (dist[k] ?? 0) + 1; }
console.log(`Đã gán ${out.size}/${todo.length}:`, JSON.stringify(dist));
if (!DRY) {
  let n = 0; for (const r of todo) { const l = out.get(r.id); if (!l) continue;
    const sub = `${l.type} · khối ${l.track}${r.subtopic ? " · " + r.subtopic : ""}`;
    const { error } = await sb.from("questions").update({ subtopic: sub }).eq("id", r.id); if (error) throw error; n++; }
  console.log(`Đã ghi ${n} câu.`);
}
const cost = (usage.in * PRICE_IN + usage.out * PRICE_OUT) / 1e6;
console.log(`Gọi API ${usage.calls} lần · chi phí ước tính ≈ $${cost.toFixed(2)}`);
if (usage.calls) await sb.from("ai_spend").insert({ label: `Gán nhãn dạng câu Tiếng Trung${DRY ? " (dry)" : ""}`, tokens_in: usage.in, tokens_out: usage.out, usd: Number(cost.toFixed(4)) });
