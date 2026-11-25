// Kiểm tra mẫu lô: mỗi lô câu do AI soạn (tách theo môn) được rút ngẫu nhiên một mẫu cố định.
// Mẫu cố định theo mã lô nên không cần lưu trong DB, và mọi giáo viên cùng môn thấy cùng một mẫu.
// Thuần logic, không phụ thuộc DB, để kiểm thử được.

/** Cỡ mẫu: 10% số câu của lô, tối thiểu 5, tối đa 20, không vượt quá cỡ lô. */
export const sampleNeeded = (batchSize: number) => Math.min(batchSize, Math.min(20, Math.max(5, Math.ceil(batchSize * 0.1))));

/** FNV-1a 32 bit + bước trộn của MurmurHash3: băm ổn định, trải đều (chuỗi gần giống nhau không cho giá trị gần nhau). */
function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

/** Mẫu của một lô: xếp id theo băm (mã lô + id), lấy sampleNeeded(n) câu đầu. */
export function sampleIds(ids: string[], lotKey: string): string[] {
  return [...ids].sort((a, b) => fnv(`${lotKey}:${a}`) - fnv(`${lotKey}:${b}`) || a.localeCompare(b)).slice(0, sampleNeeded(ids.length));
}

export type LotRow = { id: string; status: string; auto_published: boolean };
export type LotStatus = "todo" | "doing" | "failed" | "passed" | "done";
export type LotState = {
  total: number; sample: string[]; reviewed: number; rejected: number;
  /** Câu mẫu tiếp theo cần xem (null = đã xem hết mẫu). */
  next: string | null;
  /** Số câu của lô còn đang hiển thị mà chưa có giáo viên xác nhận. */
  remaining: number;
  status: LotStatus;
};

/** Câu đã được giáo viên xử lý: đã loại, hoặc đã duyệt và không còn ở trạng thái "tự công bố". */
const handled = (r: LotRow) => r.status === "rejected" || (r.status === "approved" && !r.auto_published);

export function lotState(rows: LotRow[], lotKey: string): LotState {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const sample = sampleIds(rows.map((r) => r.id), lotKey);
  const s = sample.map((id) => byId.get(id)!);
  const reviewed = s.filter(handled).length;
  const rejected = s.filter((r) => r.status === "rejected").length;
  const remaining = rows.filter((r) => r.status === "approved" && r.auto_published).length;
  const next = s.find((r) => !handled(r))?.id ?? null;
  const status: LotStatus = remaining === 0 ? "done" : rejected > 0 ? "failed" : next === null ? "passed" : reviewed > 0 ? "doing" : "todo";
  return { total: rows.length, sample, reviewed, rejected, next, remaining, status };
}

/** Khóa lô theo môn, dùng trong URL: "<batch_id>~<subject>". */
export const lotKey = (batch: string, subject: string) => `${batch}~${subject}`;
export function parseLotKey(k: string | undefined): { batch: string; subject: string } | null {
  const m = /^([\w.:-]{1,80})~(math|physics|chemistry|chinese)$/.exec(k ?? "");
  return m ? { batch: m[1], subject: m[2] } : null;
}
