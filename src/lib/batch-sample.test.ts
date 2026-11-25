import { test } from "node:test";
import assert from "node:assert/strict";
import { lotKey, lotState, parseLotKey, sampleIds, sampleNeeded, type LotRow } from "./batch-sample.ts";

const ids = (n: number) => Array.from({ length: n }, (_, i) => `q${String(i).padStart(4, "0")}`);
const live = (id: string): LotRow => ({ id, status: "approved", auto_published: true });

test("cỡ mẫu: 10%, tối thiểu 5, tối đa 20, không vượt cỡ lô", () => {
  assert.deepEqual([3, 30, 77, 235, 522].map(sampleNeeded), [3, 5, 8, 20, 20]);
});

test("mẫu cố định theo lô, không phụ thuộc thứ tự đầu vào, khác nhau giữa các lô", () => {
  const a = sampleIds(ids(200), "b1~physics");
  assert.equal(a.length, 20);
  assert.deepEqual(sampleIds([...ids(200)].reverse(), "b1~physics"), a);
  assert.notDeepEqual(sampleIds(ids(200), "b2~physics"), a);
  assert.equal(new Set(a).size, 20);
});

test("mẫu trải đều, không dồn vào đầu danh sách", () => {
  const a = sampleIds(ids(1000), "lot").map((x) => Number(x.slice(1)));
  const quarters = new Set(a.map((n) => Math.floor(n / 250)));
  assert.equal(quarters.size, 4, `mẫu chỉ rơi vào ${quarters.size}/4 phần tư: ${a.join(",")}`);
});

test("tiến trình lô: chưa làm → đang làm → đạt → xong", () => {
  const key = "b~math", rows = ids(50).map(live);
  let s = lotState(rows, key);
  assert.equal(s.status, "todo"); assert.equal(s.sample.length, 5); assert.equal(s.remaining, 50); assert.equal(s.next, s.sample[0]);

  const mark = (id: string, patch: Partial<LotRow>) => { const r = rows.find((x) => x.id === id)!; Object.assign(r, patch); };
  mark(s.sample[0], { auto_published: false });
  s = lotState(rows, key);
  assert.equal(s.status, "doing"); assert.equal(s.reviewed, 1); assert.equal(s.next, s.sample[1]);

  for (const id of s.sample) mark(id, { auto_published: false });
  s = lotState(rows, key);
  assert.equal(s.status, "passed"); assert.equal(s.next, null); assert.equal(s.remaining, 45);

  for (const r of rows) r.auto_published = false;
  assert.equal(lotState(rows, key).status, "done");
});

test("một câu mẫu bị loại: lô không đạt", () => {
  const key = "b~chemistry", rows = ids(30).map(live);
  const s0 = lotState(rows, key);
  rows.find((r) => r.id === s0.sample[2])!.status = "rejected";
  const s = lotState(rows, key);
  assert.equal(s.status, "failed"); assert.equal(s.rejected, 1); assert.equal(s.remaining, 29);
});

test("khóa lô trong URL: chỉ nhận mã lô hợp lệ và môn hợp lệ", () => {
  assert.deepEqual(parseLotKey(lotKey("b-202611020356-m2rg", "physics")), { batch: "b-202611020356-m2rg", subject: "physics" });
  assert.equal(parseLotKey("b1~history"), null);
  assert.equal(parseLotKey("b1,x~math"), null);
  assert.equal(parseLotKey(undefined), null);
});
