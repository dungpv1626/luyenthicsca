import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAttribution, sourceLabel } from "./attribution.ts";

const enc = (o: unknown) => encodeURIComponent(JSON.stringify(o));

test("parseAttribution: chuẩn hóa, cắt độ dài, bỏ ký tự nguy hiểm", () => {
  assert.equal(parseAttribution(undefined), null);
  assert.equal(parseAttribution("không phải json"), null);
  assert.equal(parseAttribution(enc({ src: "", med: "", camp: "", ref: "", lp: "" })), null);
  const a = parseAttribution(enc({ src: "Zalo", med: "Post", ref: "WWW.Google.com", lp: "/blog/csca-la-gi", camp: "<b>x</b>" }))!;
  assert.equal(a.src, "zalo"); assert.equal(a.med, "post"); assert.equal(a.ref, "www.google.com"); assert.equal(a.lp, "/blog/csca-la-gi"); assert.equal(a.camp, "bx/b".replace("/", "/")); 
  assert.equal(parseAttribution(enc({ lp: "http://evil.example" })), null); // trang đích phải là đường dẫn nội bộ
  assert.ok(parseAttribution(enc({ src: "a".repeat(500) }))!.src!.length <= 40);
});

test("sourceLabel: utm → tên miền giới thiệu → trực tiếp → không rõ", () => {
  assert.equal(sourceLabel(null), "Không rõ (trước khi có theo dõi)");
  assert.equal(sourceLabel({ src: "zalo", med: "post" }), "zalo / post");
  assert.equal(sourceLabel({ src: "facebook" }), "facebook");
  assert.equal(sourceLabel({ ref: "www.google.com" }), "google.com");
  assert.equal(sourceLabel({ lp: "/" }), "Trực tiếp");
});
