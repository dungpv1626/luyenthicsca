import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, TOPICS, MODULES, topicByKey, OUT } from "./syllabus.ts";

const c = (subject: string, topic: string, subtopic: string | null = null) => classify({ subject, topic, subtopic });

test("mỗi chuyên đề thuộc một mô-đun có thật và khóa không trùng", () => {
  for (const [s, list] of Object.entries(TOPICS)) {
    const keys = new Set<string>(); const mods = new Set(MODULES[s as keyof typeof MODULES].map((m) => m.key));
    for (const t of list) { assert.ok(!keys.has(t.key), `trùng khóa ${s}.${t.key}`); keys.add(t.key); assert.ok(mods.has(t.module), `${s}.${t.key}: mô-đun ${t.module} không tồn tại`); assert.ok(t.vi && t.en && t.zh && t.desc, `${s}.${t.key} thiếu tên/mô tả`); }
    for (const m of mods) assert.ok(list.some((t) => t.module === m), `${s}: mô-đun ${m} chưa có chuyên đề nào`);
  }
});

test("gán chuyên đề đúng theo đề cương chính thức", () => {
  assert.deepEqual(c("chemistry", "Oxi hóa–khử", "điện phân"), { module: "theory", topic: "electrolyte" }); // đề mẫu chính thức có câu điện phân
  assert.deepEqual(c("chemistry", "Thí nghiệm và ứng dụng", "chuẩn độ axit–bazơ"), { module: "concept_calc", topic: "conc_ph" });
  assert.deepEqual(c("chemistry", "Thí nghiệm và ứng dụng", "pha chế dung dịch"), { module: "concept_calc", topic: "conc_ph" });
  assert.deepEqual(c("chemistry", "Thí nghiệm và ứng dụng", "điều chế và thu khí hiđro"), { module: "experiment", topic: "gas_prep" });
  assert.deepEqual(c("chemistry", "Phản ứng hóa học", "nhiệt hóa học"), { module: OUT, topic: null });
  assert.deepEqual(c("physics", "Nhiệt học", "nhiệt lượng"), { module: OUT, topic: null });
  assert.deepEqual(c("physics", "Nhiệt học", "khí lí tưởng – quá trình đẳng nhiệt"), { module: "thermal", topic: "ideal_gas" });
  assert.deepEqual(c("physics", "Quang học", "thấu kính hội tụ"), { module: OUT, topic: null });
  assert.deepEqual(c("physics", "Quang học", "phản xạ toàn phần"), { module: "optics", topic: "optics_geometric" });
  assert.deepEqual(c("physics", "Sóng", "giao thoa ánh sáng (khoảng vân)"), { module: "optics", topic: "optics_wave" });
  assert.deepEqual(c("physics", "Sóng", "sóng dừng"), { module: "mechanics", topic: "oscillation_waves" });
  assert.deepEqual(c("physics", "Điện học", "định luật ôm – mạch nối tiếp"), { module: "electromag", topic: "dc_circuits" });
  assert.deepEqual(c("physics", "Vật lý hiện đại", "phóng xạ: chu kì bán rã"), { module: "modern", topic: "nuclear" });
  assert.deepEqual(c("math", "Đại số", "hệ thức Vi-ét"), { module: OUT, topic: null });
  assert.deepEqual(c("math", "Xác suất", "xác suất có điều kiện"), { module: OUT, topic: null });
  assert.deepEqual(c("math", "Xác suất", "thống kê: phương sai"), { module: "prob_stat", topic: "stats" });
  assert.deepEqual(c("math", "Lượng giác", "diện tích tam giác"), { module: OUT, topic: null });
  assert.deepEqual(c("math", "Giải tích", "đạo hàm của đa thức"), { module: "function", topic: "deriv" });
  assert.deepEqual(c("math", "Giải tích", "tích phân xác định"), { module: OUT, topic: null });
  assert.deepEqual(c("math", "Dãy số", "cấp số cộng"), { module: "function", topic: "sequence" });
  assert.deepEqual(c("math", "Hình học", "khoảng cách điểm–đường thẳng"), { module: "geo_alg", topic: "lines_circles" });
});

test("câu chưa khớp quy tắc chuyên đề vẫn có mô-đun (quy tắc cũ), chưa gán chuyên đề", () => {
  assert.deepEqual(c("math", "Đại số", null), { module: "set_ineq", topic: null });
  assert.deepEqual(c("physics", "Cơ học", null), { module: "mechanics", topic: null });
  assert.deepEqual(c("chinese", "Đọc hiểu", null), { module: "reading", topic: null });
});

test("tên và mô tả chuyên đề truy được theo khóa", () => {
  assert.equal(topicByKey("physics", "magnetic")?.zh, "磁场");
  assert.equal(topicByKey("math", "xxx"), undefined);
});
