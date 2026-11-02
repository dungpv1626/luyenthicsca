#!/usr/bin/env node
// Sinh câu hỏi GỐC theo blueprint → kiểm tra tự động → vào hàng chờ duyệt (status = 'review').
// KHÔNG BAO GIỜ tự đặt 'approved': giáo viên là chốt chặn cuối.
//
// Cách chạy (cần SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, ANTHROPIC_API_KEY trong .env.local):
//   node --env-file=.env.local scripts/generate-questions.mjs --pilot            # lô thử 40 câu (10/môn)
//   node --env-file=.env.local scripts/generate-questions.mjs --subject math --topic "Đại số" --difficulty easy --count 5
//   node --env-file=.env.local scripts/generate-questions.mjs --fill --subject math --max 60 [--overshoot 1.3]
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i < 0 ? d : (process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]); };
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const CONCURRENCY = Number(arg("concurrency", 3));
const DRY = !!arg("dry", false);
const BATCH = `b-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

const SUBJECTS = { math: "Toán (Mathematics)", physics: "Vật lý (Physics)", chemistry: "Hóa học (Chemistry)", chinese: "Professional Chinese (tiếng Trung chuyên ngành khoa học–kỹ thuật)" };
const DIFF = {
  easy: "DỄ: một bước, nhớ định nghĩa/công thức hoặc áp dụng trực tiếp (~30–60 giây).",
  medium: "TRUNG BÌNH: 2–3 bước suy luận hoặc kết hợp hai khái niệm (~60–90 giây).",
  hard: "KHÓ: nhiều bước, cần kết nối khái niệm hoặc tránh bẫy phổ biến, nhưng vẫn giải được trong 2–3 phút, KHÔNG đánh đố.",
};

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const claude = new Anthropic();
const usage = { in: 0, out: 0, calls: 0 };

// ---------- schema trả về của Claude (tool use → luôn là JSON hợp lệ) ----------
const options = { type: "object", properties: Object.fromEntries("ABCD".split("").map((k) => [k, { type: "string" }])), required: ["A", "B", "C", "D"] };
const lang = { type: "object", properties: { body: { type: "string" }, options, explanation: { type: "string" } }, required: ["body", "options", "explanation"] };
const GEN_TOOL = {
  name: "submit_questions",
  description: "Nộp danh sách câu hỏi trắc nghiệm gốc, mỗi câu có 3 phiên bản ngôn ngữ tương đương.",
  input_schema: {
    type: "object",
    properties: { questions: { type: "array", items: { type: "object", properties: {
      subtopic: { type: "string" }, skill: { type: "string" }, est_time_sec: { type: "integer" },
      correct: { type: "string", enum: ["A", "B", "C", "D"] }, vi: lang, en: lang, zh: lang,
    }, required: ["subtopic", "skill", "est_time_sec", "correct", "vi", "en", "zh"] } } },
    required: ["questions"],
  },
};
const ANS_TOOL = {
  name: "answer",
  description: "Chọn đáp án.",
  input_schema: { type: "object", properties: { reasoning: { type: "string" }, choice: { type: "string", enum: ["A", "B", "C", "D"] } }, required: ["reasoning", "choice"] },
};

const SYSTEM = `Bạn là giáo viên giàu kinh nghiệm, soạn câu hỏi trắc nghiệm GỐC để luyện thi CSCA cho học sinh Việt Nam.

QUY TẮC BẮT BUỘC
1. Câu hỏi hoàn toàn do bạn tự soạn. Không sao chép hay biến đổi nhẹ đề thi/sách bài tập có sẵn; dùng số liệu và ngữ cảnh mới.
2. Mỗi câu kiểm tra MỘT khái niệm rõ ràng, có đúng MỘT đáp án đúng; 4 lựa chọn A–D khác nhau, độ dài tương đương. Cấm "tất cả đều đúng/sai", "không đáp án nào".
3. Đáp án nhiễu phải phản ánh LỖI SAI THƯỜNG GẶP (nhầm dấu, nhầm công thức, quên đổi đơn vị…), hợp lý chứ không vô nghĩa.
4. Tự giải câu hỏi từng bước trước khi nộp; đảm bảo đáp án đúng chính xác về mặt khoa học. Số liệu phải đẹp/hợp lý, đơn vị đầy đủ. Nếu không chắc, bỏ câu đó và soạn câu khác.
5. Công thức toán/lý/hóa viết bằng LaTeX trong $...$ (vd $x^2-5x+6=0$, $\\mathrm{H_2SO_4}$, $v=\\dfrac{s}{t}$). Không dùng Markdown khác.
6. Giải thích (explanation): ngắn gọn, từng bước, nêu vì sao đáp án đúng và (nếu cần) vì sao một đáp án nhiễu sai.
   TUYỆT ĐỐI KHÔNG viết chữ cái đáp án trần (A, B, C, D) trong explanation, vì hệ thống sẽ xáo trộn thứ tự lựa chọn. Khi cần nhắc tới một lựa chọn, dùng ký hiệu [[A]], [[B]], [[C]], [[D]] theo đúng chữ cái bạn đã gán trong câu đó (hệ thống sẽ tự đổi sang chữ cái cuối cùng), hoặc mô tả nội dung lựa chọn (ví dụ "kết quả 0,40 M sai vì…"). Không viết "đáp án đúng là B".
7. BA PHIÊN BẢN vi / en / zh phải TƯƠNG ĐƯƠNG TUYỆT ĐỐI về nội dung, số liệu và THỨ TỰ lựa chọn (A–D giống nhau ở cả ba). "zh" là tiếng Trung giản thể, văn phong học thuật chuẩn.
8. Môn Professional Chinese: kiểm tra năng lực hiểu tiếng Trung học thuật khoa học–kỹ thuật. Giữ NGUYÊN văn bản tiếng Trung được hỏi trong cả ba phiên bản; chỉ dịch phần hướng dẫn và các lựa chọn (bản zh dùng giải thích/đáp án bằng tiếng Trung đơn giản). Trong explanation luôn kèm pinyin cho từ khóa.
9. est_time_sec: thời gian hợp lý cho học sinh (20–180). skill: kỹ năng được kiểm tra (vài từ).
10. Không dùng nội dung nhạy cảm chính trị/tôn giáo.
Chỉ trả kết quả bằng công cụ submit_questions.`;

// ---------- tiện ích ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function call(params, tries = 4) {
  for (let i = 0; ; i++) {
    try {
      const r = await claude.messages.create({ model: MODEL, ...params });
      usage.calls++; usage.in += r.usage?.input_tokens ?? 0; usage.out += r.usage?.output_tokens ?? 0;
      return r;
    } catch (e) {
      if (i >= tries - 1 || ![408, 429, 500, 502, 503, 529].includes(e.status ?? 0)) throw e;
      await sleep(2000 * 2 ** i);
    }
  }
}
const tool = (r, name) => r.content.find((c) => c.type === "tool_use" && c.name === name)?.input;
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const shingles = (s) => { const t = s.toLowerCase().replace(/\$[^$]*\$/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean); const out = new Set(); for (let i = 0; i + 2 < t.length; i++) out.add(t.slice(i, i + 3).join(" ")); if (!out.size) t.forEach((w) => out.add(w)); return out; };
const jaccard = (a, b) => { if (!a.size || !b.size) return 0; let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n); };
// Chữ cái đáp án "trần" trong lời giải (ngoài LaTeX). Chữ cái phải VIẾT HOA và theo sau không phải chữ/số
// (tránh nhầm "lựa chọn còn lại", "phương án dừng"…).
const KW = /(?:[Đđ]áp án|[Pp]hương án|[Ll]ựa chọn|[Oo]ption|[Aa]nswer|[Cc]hoice|选项|答案)\s*[ABCD](?![\p{L}\p{N}])/u;
const SUB = /(?:^|[\s(（,;])[ABCD]\s*(?:sai|đúng|nhầm|là|do|vì|is|are|was|wrong|correct|错|对|是)(?![\p{L}\p{N}])/u;
const bareLetters = (t) => { const x = String(t ?? "").replace(/\$[^$]*\$/g, " "); return KW.test(x) || SUB.test(x); };
const FIX_TOOL = {
  name: "fix_explanations",
  description: "Nộp lại lời giải 3 ngôn ngữ, không dùng chữ cái đáp án.",
  input_schema: { type: "object", properties: { vi: { type: "string" }, en: { type: "string" }, zh: { type: "string" } }, required: ["vi", "en", "zh"] },
};
/** Viết lại lời giải: bỏ mọi chữ cái A/B/C/D, mô tả lựa chọn bằng nội dung. Trả về null nếu vẫn còn chữ cái. */
async function rewriteExplanations(vi, en, zh, correct) {
  const r = await call({
    max_tokens: 3500,
    system: "Bạn là giáo viên. Viết lại lời giải của câu trắc nghiệm ở 3 ngôn ngữ (vi/en/zh). TUYỆT ĐỐI không dùng chữ cái A, B, C, D để chỉ lựa chọn (cả khi viết 'đáp án B', 'C sai'…); thay bằng mô tả NỘI DUNG lựa chọn (vd: 'kết quả 0,40 M sai vì…', 'phương án nói rằng… sai vì…'). Giữ nguyên nội dung khoa học, số liệu, LaTeX, pinyin của từ khóa tiếng Trung; ba bản tương đương nhau; ngắn gọn. Nộp bằng công cụ fix_explanations.",
    tools: [FIX_TOOL],
    messages: [{ role: "user", content: JSON.stringify({ cau_hoi: asText(vi), dap_an_dung_la_lua_chon_so: correct, loi_giai_hien_tai: { vi: vi.explanation, en: en.explanation, zh: zh.explanation } }) }],
  });
  const fx = tool(r, "fix_explanations");
  if (!fx || ![fx.vi, fx.en, fx.zh].every((t) => String(t ?? "").trim())) return null;
  return [fx.vi, fx.en, fx.zh].some(bareLetters) ? null : fx;
}
const asText = (l) => `${l.body}\n${["A", "B", "C", "D"].map((k) => `${k}. ${l.options[k]}`).join("\n")}`;

// ---------- một "ô" blueprint: sinh → xáo trộn → kiểm tra → lưu ----------
const known = {}; // subject -> [{id, sh}]
async function loadKnown(subject) {
  if (known[subject]) return known[subject];
  const { data } = await sb.from("questions").select("id, body").eq("subject", subject);
  return (known[subject] = (data ?? []).map((q) => ({ id: q.id, sh: shingles(q.body) })));
}

async function runTask({ subject, topic, difficulty, count, hints }) {
  const stats = { gen: 0, pass: 0, mismatch: 0, invalid: 0, dupSkipped: 0, saved: 0 };
  const { data: prior } = await sb.from("questions").select("body").eq("subject", subject).eq("topic", topic).order("created_at", { ascending: false }).limit(25);
  const res = await call({
    max_tokens: 12000,
    system: SYSTEM,
    tools: [GEN_TOOL],
    messages: [{ role: "user", content: JSON.stringify({
      mon: SUBJECTS[subject], chu_de: topic, do_kho: DIFF[difficulty], so_cau: count,
      goi_y_chu_de_con_de_da_dang: hints || undefined,
      huong_dan: "Mỗi câu thuộc một chủ đề con KHÁC nhau và ngữ cảnh khác nhau.",
      cac_de_bai_da_co_can_tranh_trung: (prior ?? []).map((p) => p.body.slice(0, 90)),
    }) }],
  });
  const out = tool(res, "submit_questions")?.questions ?? [];
  const rows = [];
  for (const q of out) {
    stats.gen++;
    if (!["A", "B", "C", "D"].includes(q.correct)) { stats.invalid++; continue; } // không có đáp án đúng hợp lệ
    // xáo trộn thứ tự đáp án (cùng một hoán vị cho cả 3 ngôn ngữ) để tránh thiên lệch vị trí
    const perm = shuffle(["A", "B", "C", "D"]); // perm[i] = chữ cái gốc đặt vào vị trí mới i
    const EMPTY = { body: "", options: { A: "", B: "", C: "", D: "" }, explanation: "" };
    const remap = (l) => { const x = l && l.options ? l : EMPTY; return { ...x, options: Object.fromEntries(perm.map((orig, i) => ["ABCD"[i], x.options[orig] ?? ""])) }; };
    const vi = remap(q.vi), en = remap(q.en), zh = remap(q.zh);
    // đổi [[X]] (chữ cái gốc) → chữ cái sau xáo trộn trong lời giải của cả 3 ngôn ngữ
    const fixLetters = (t) => String(t ?? "").replace(/\[\[([ABCD])\]\]/g, (_, o) => "ABCD"[perm.indexOf(o)]);
    for (const l of [vi, en, zh]) l.explanation = fixLetters(l.explanation);
    const correct = "ABCD"[perm.indexOf(q.correct)];

    const vals = Object.values(vi.options).map((s) => String(s).trim());
    const issues = [];
    if (vals.some((v) => !v) || new Set(vals.map((v) => v.toLowerCase())).size < 4) issues.push("đáp án rỗng hoặc trùng nhau");
    if (vi.body.trim().length < 12) issues.push("đề quá ngắn");
    for (const [k, l] of [["en", en], ["zh", zh]]) if (!l.body?.trim() || Object.values(l.options).some((v) => !String(v).trim())) issues.push(`thiếu bản ${k}`);
    if (!vi.explanation?.trim()) issues.push("thiếu giải thích");
    // còn sót chữ cái đáp án "trần" trong lời giải (ngoài công thức LaTeX) → sau xáo trộn sẽ sai
    if ([vi, en, zh].some((l) => bareLetters(l.explanation))) {
      let fixed = null;
      if (!issues.length) { try { fixed = await rewriteExplanations(vi, en, zh, correct); } catch { /* giữ cờ */ } }
      if (fixed) { vi.explanation = fixed.vi; en.explanation = fixed.en; zh.explanation = fixed.zh; }
      else issues.push("lời giải còn nhắc chữ cái đáp án (sẽ sai sau khi xáo trộn)");
    }

    // chống trùng lặp
    const sh = shingles(vi.body);
    const pool = await loadKnown(subject);
    let best = { id: null, s: 0 };
    for (const k of pool) { const s = jaccard(sh, k.sh); if (s > best.s) best = { id: k.id, s }; }
    if (best.s >= 0.7) { stats.dupSkipped++; continue; }

    // giải độc lập (không thấy đáp án)
    let verify = "unchecked", note = issues.join("; ");
    if (!issues.length) {
      try {
        const ans = tool(await call({
          max_tokens: 1500,
          system: "Bạn là học sinh giỏi. Giải câu trắc nghiệm sau cẩn thận từng bước rồi nộp đáp án bằng công cụ answer (chọn đúng MỘT đáp án).",
          tools: [ANS_TOOL],
          messages: [{ role: "user", content: asText(vi) }],
        }), "answer");
        if (ans?.choice === correct) { verify = "pass"; stats.pass++; }
        else { verify = "mismatch"; stats.mismatch++; note = `Người giải độc lập chọn ${ans?.choice}, đáp án soạn là ${correct}. ${String(ans?.reasoning ?? "").slice(0, 300)}`; }
      } catch (e) { verify = "unchecked"; note = "Giải độc lập lỗi: " + String(e.message).slice(0, 120); }
    } else { verify = "invalid"; stats.invalid++; }
    if (best.s >= 0.5) note = (note ? note + " · " : "") + `Gần giống một câu đã có (${Math.round(best.s * 100)}%)`;

    rows.push({
      subject, topic, difficulty, language: "vi",
      body: vi.body, options: vi.options, correct_answer: correct, explanation: vi.explanation,
      translations: { en: { body: en.body, options: en.options, explanation: en.explanation }, zh: { body: zh.body, options: zh.options, explanation: zh.explanation } },
      skill: String(q.skill).slice(0, 80), est_time_sec: Math.min(300, Math.max(15, q.est_time_sec | 0)),
      source: "Soạn bởi AI (Claude) – câu gốc, chờ giáo viên duyệt",
      origin: "ai_generated", batch_id: BATCH, status: "review",
      verify_status: verify, verify_note: note || null, similar_to: best.s >= 0.5 && best.id !== "pending" ? best.id : null,
    });
    pool.push({ id: "pending", sh });
  }
  if (rows.length && !DRY) {
    const { data, error } = await sb.from("questions").insert(rows).select("id");
    if (error) throw new Error(error.message);
    stats.saved = data.length;
  } else stats.saved = DRY ? 0 : rows.length;
  return stats;
}

async function pool(tasks, n, fn) {
  const results = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < tasks.length) {
      const t = tasks[i++];
      try { const r = await fn(t); results.push({ t, r }); if (t.count !== undefined) console.log(`✓ ${t.subject} · ${t.topic} · ${t.difficulty} ×${t.count}: tạo ${r.gen}, đạt ${r.pass}, lệch ${r.mismatch}, lỗi ${r.invalid}, trùng ${r.dupSkipped}, lưu ${r.saved}`); }
      catch (e) { console.error(`✗ ${t.subject ?? t.id} · ${t.topic ?? ""}: ${e.message}`); results.push({ t, r: null }); }
    }
  }));
  return results;
}

// ---------- chế độ chạy ----------
async function reverify() {
  const { data } = await sb.from("questions").select("*").eq("origin", "ai_generated").eq("status", "review").in("verify_status", ["invalid", "unchecked"]);
  console.log(`Kiểm tra lại ${data.length} câu…`);
  let fixed = 0, still = 0, mism = 0;
  await pool(data, CONCURRENCY, async (q) => {
    const issues = [];
    const en = q.translations?.en, zh = q.translations?.zh;
    if (!q.explanation?.trim()) issues.push("thiếu giải thích");
    if (!en?.body || !zh?.body) issues.push("thiếu bản dịch");
    let textPatch = {};
    if ([q.explanation, en?.explanation, zh?.explanation].some(bareLetters)) {
      let fixed = null;
      if (!issues.length) { try { fixed = await rewriteExplanations({ body: q.body, options: q.options, explanation: q.explanation }, en, zh, q.correct_answer); } catch { /* giữ cờ */ } }
      if (fixed) { q.explanation = fixed.vi; textPatch = { explanation: fixed.vi, translations: { ...q.translations, en: { ...en, explanation: fixed.en }, zh: { ...zh, explanation: fixed.zh } } }; }
      else issues.push("lời giải còn nhắc chữ cái đáp án (sẽ sai sau khi xáo trộn)");
    }
    let patch;
    if (issues.length) { still++; patch = { verify_status: "invalid", verify_note: issues.join("; ") }; }
    else {
      const ans = tool(await call({ max_tokens: 1500, system: "Bạn là học sinh giỏi. Giải câu trắc nghiệm sau cẩn thận từng bước rồi nộp đáp án bằng công cụ answer (chọn đúng MỘT đáp án).", tools: [ANS_TOOL], messages: [{ role: "user", content: asText(q) }] }), "answer");
      if (ans?.choice === q.correct_answer) { fixed++; patch = { verify_status: "pass", verify_note: null }; }
      else { mism++; patch = { verify_status: "mismatch", verify_note: `Người giải độc lập chọn ${ans?.choice}, đáp án soạn là ${q.correct_answer}. ${String(ans?.reasoning ?? "").slice(0, 300)}` }; }
    }
    if (!DRY) await sb.from("questions").update({ ...patch, ...textPatch }).eq("id", q.id);
    return { gen: 0, pass: 0, mismatch: 0, invalid: 0, dupSkipped: 0, saved: 0 };
  });
  console.log(`Sau kiểm tra lại: đạt ${fixed} · lệch ${mism} · vẫn lỗi ${still}`);
}

async function main() {
  if (arg("reverify", false)) return reverify();
  const { data: bp, error } = await sb.from("blueprint").select("*").order("subject").order("topic");
  if (error) throw new Error(error.message);
  const hintsOf = (s, t) => bp.find((b) => b.subject === s && b.topic === t)?.hints ?? "";
  let tasks = [];

  if (arg("pilot", false)) {
    const pattern = ["easy", "medium", "medium", "hard", "easy"];
    for (const subject of Object.keys(SUBJECTS)) {
      const topics = [...new Set(bp.filter((b) => b.subject === subject).map((b) => b.topic))].slice(0, 5);
      topics.forEach((topic, i) => tasks.push({ subject, topic, difficulty: pattern[i], count: 2, hints: hintsOf(subject, topic) }));
    }
  } else if (arg("fill", false)) {
    const overshoot = Number(arg("overshoot", 1.3));
    const { data: prog, error: e2 } = await sb.rpc("admin_blueprint_progress");
    if (e2) throw new Error(e2.message);
    const only = arg("subject", null);
    // Lấp đều: luôn chọn ô blueprint đang có tỉ lệ (đã có + dự kiến) / mục tiêu thấp nhất.
    const cells = prog.filter((p) => !only || p.subject === only).map((p) => {
      const goal = Math.ceil(p.target * overshoot);
      return { p, goal, have: p.approved + p.in_review + p.drafted, planned: 0 };
    }).filter((c) => c.goal > c.have);
    const max = Number(arg("max", 60));
    let total = 0;
    while (total < max) {
      const open = cells.filter((c) => c.have + c.planned < c.goal);
      if (!open.length) break;
      open.sort((x, y) => (x.have + x.planned) / x.goal - (y.have + y.planned) / y.goal);
      const c = open[0];
      const n = Math.min(5, c.goal - c.have - c.planned, max - total);
      tasks.push({ subject: c.p.subject, topic: c.p.topic, difficulty: c.p.difficulty, count: n, hints: hintsOf(c.p.subject, c.p.topic) });
      c.planned += n; total += n;
    }
  } else {
    const subject = arg("subject", null), topic = arg("topic", null), difficulty = arg("difficulty", "medium");
    if (!SUBJECTS[subject] || !topic || !DIFF[difficulty]) { console.error("Thiếu/không hợp lệ: --subject math|physics|chemistry|chinese --topic \"...\" --difficulty easy|medium|hard --count N"); process.exit(1); }
    tasks.push({ subject, topic, difficulty, count: Number(arg("count", 5)), hints: hintsOf(subject, topic) });
  }

  console.log(`Lô ${BATCH}: ${tasks.length} nhiệm vụ, ${tasks.reduce((s, t) => s + t.count, 0)} câu yêu cầu${DRY ? " (DRY-RUN: không lưu)" : ""}. Model ${MODEL}.`);
  const res = await pool(tasks, CONCURRENCY, runTask);
  const sum = (k) => res.reduce((s, x) => s + (x.r?.[k] ?? 0), 0);
  console.log(`\n=== TỔNG KẾT lô ${BATCH} ===\nTạo ${sum("gen")} · đạt giải độc lập ${sum("pass")} · lệch đáp án ${sum("mismatch")} · lỗi cấu trúc ${sum("invalid")} · bỏ vì trùng ${sum("dupSkipped")} · đã lưu ${sum("saved")} · nhiệm vụ lỗi ${res.filter((x) => !x.r).length}`);
  console.log(`Gọi API ${usage.calls} lần · token vào ${usage.in} · ra ${usage.out}`);
}
main().catch((e) => { console.error("LỖI:", e.message); process.exit(1); });
