import { test } from "node:test";
import assert from "node:assert/strict";
import { numbersIn, optionValue, variantFlags, variantScore } from "./template-variants.ts";

const keys = (v: { body: string; options: Record<string, string> }) => variantFlags(v).map((f) => f.key).sort();

test("đọc số: bỏ đơn vị và số mũ, hiểu dấu phẩy thập phân", () => {
  assert.deepEqual(numbersIn("gia tốc $2\\ \\text{m/s}^2$").map((n) => n.value), [2]);
  assert.deepEqual(numbersIn("$0{,}5\\ \\text{m/s}^2$").map((n) => n.value), [0.5]);
  assert.deepEqual(numbersIn("$-3$ và $x_1 = 4$").map((n) => n.value), [-3, 4]);
  assert.equal(optionValue("$12\\ \\text{m}$"), 12);
  assert.equal(optionValue("$\\dfrac{1}{2}$"), null);
  assert.equal(optionValue("$90.000.000\\ \\text{đồng}$"), 90000000);
  assert.equal(optionValue("$1.500$"), 1500);
});

test("tiền tệ hàng nghìn/triệu không bị coi là trùng", () => {
  assert.deepEqual(keys({ body: "x", options: { A: "$3.000\\ \\text{đồng}$", B: "$90.000.000\\ \\text{đồng}$", C: "$45.000\\ \\text{đồng}$", D: "$90.000\\ \\text{đồng}$" } }), []);
});

test("Toán: số âm và số 0 trong đề là bình thường; đáp án bằng 0 vẫn được đánh dấu", () => {
  const k = (v: { body: string; options: Record<string, string> }) => variantFlags(v, "math").map((f) => f.key).sort();
  assert.deepEqual(k({ body: "$y=-2x^2-12x$, tại $x=0$", options: { A: "$-4$", B: "$4$", C: "$-14$", D: "$-3$" } }), []);
  assert.deepEqual(k({ body: "x", options: { A: "$0$", B: "$4$", C: "$1$", D: "$2$" } }), ["zero"]);
});

test("biến thể bình thường: không có cờ", () => {
  assert.deepEqual(keys({ body: "Vận tốc đầu $14\\ \\text{m/s}$, gia tốc $2\\ \\text{m/s}^2$, trong 2 s", options: { A: "$4\\ \\text{m}$", B: "$30\\ \\text{m}$", C: "$32\\ \\text{m}$", D: "$36\\ \\text{m}$" } }), []);
});

test("giá trị biên: bằng 0, trùng đáp án, số âm, số lẻ dài", () => {
  assert.deepEqual(keys({ body: "vận tốc đầu $0\\ \\text{m/s}$", options: { A: "$98$", B: "$196$", C: "$14$", D: "$0\\ \\text{m}$" } }), ["zero"]);
  assert.deepEqual(keys({ body: "x", options: { A: "$0{,}5$", B: "$0.5$", C: "$1$", D: "$2$" } }), ["dup"]);
  assert.deepEqual(keys({ body: "x", options: { A: "$3$", B: "$3$", C: "$1$", D: "$2$" } }), ["dup"]);
  assert.deepEqual(keys({ body: "x", options: { A: "$-3$", B: "$3$", C: "$1$", D: "$2$" } }), ["neg"]);
  assert.deepEqual(keys({ body: "x", options: { A: "$1{,}23456$", B: "$3$", C: "$1$", D: "$2$" } }), ["long"]);
});

test("xếp hạng: báo lỗi nặng hơn mọi cờ", () => {
  const dup = variantFlags({ body: "x", options: { A: "$3$", B: "$3$", C: "$0$", D: "$-1$" } });
  assert.ok(variantScore([], 1) > variantScore(dup, 0));
  assert.ok(variantScore(dup, 0) > variantScore([], 0));
});
