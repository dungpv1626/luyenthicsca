import { test } from "node:test";
import assert from "node:assert/strict";
import { isLive, reviewFlags, slugify, tocOf } from "./blog-utils.ts";

test("slugify: bỏ dấu tiếng Việt, giữ số", () => {
  assert.equal(slugify("Lệ phí thi CSCA 2027: Đã có chưa?"), "le-phi-thi-csca-2027-da-co-chua");
  assert.equal(slugify("  Điểm thi – Việt Nam  "), "diem-thi-viet-nam");
});

test("tocOf: lấy các tiêu đề ## kèm id khớp với renderer", () => {
  const md = "# Tiêu đề\n\n## Cấu trúc đề thi\n\ntext\n\n### phụ\n\n## **Lịch** thi\n";
  assert.deepEqual(tocOf(md), [{ text: "Cấu trúc đề thi", id: "cau-truc-de-thi" }, { text: "Lịch thi", id: "lich-thi" }]);
});

test("reviewFlags: phát hiện chỗ giữ chỗ và câu cần xác minh, bài sạch thì không có cờ", () => {
  assert.equal(reviewFlags("Nội dung bình thường, có [liên kết](https://csca.cn).").length, 0);
  assert.ok(reviewFlags("[CẦN XÁC MINH TRƯỚC KHI ĐĂNG: địa chỉ]").length === 1);
  assert.ok(reviewFlags("[CHÈN NÚT TẢI: PDF]").length === 1);
  assert.ok(reviewFlags("Đề do đội ngũ giáo viên biên soạn.").length === 1);
  assert.ok(reviewFlags("tài liệu do bạn cung cấp").length === 1);
});

test("isLive: nháp không hiển thị; lên lịch chỉ hiển thị khi tới ngày", () => {
  const past = new Date(Date.now() - 3600_000).toISOString(), future = new Date(Date.now() + 3600_000).toISOString();
  assert.equal(isLive({ status: "draft", publish_at: past }), false);
  assert.equal(isLive({ status: "scheduled", publish_at: future }), false);
  assert.equal(isLive({ status: "scheduled", publish_at: past }), true);
  assert.equal(isLive({ status: "published", publish_at: null }), true);
});
