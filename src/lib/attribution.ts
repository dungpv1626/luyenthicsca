// Theo dõi nguồn truy cập lần đầu (first-touch) bằng cookie của chính trang, 30 ngày. Không gửi dữ liệu cho bên thứ ba.
export const ATTR_COOKIE = "lt_attr";
export type Attribution = { src?: string; med?: string; camp?: string; ref?: string; lp?: string };

const clean = (v: unknown, n = 80) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n) : undefined) || undefined;

/** Chuẩn hóa dữ liệu đọc từ cookie (không tin dữ liệu từ trình duyệt). */
export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const a: Attribution = { src: clean(o.src, 40)?.toLowerCase(), med: clean(o.med, 40)?.toLowerCase(), camp: clean(o.camp, 60), ref: clean(o.ref, 80)?.toLowerCase(), lp: clean(o.lp, 120) };
    if (a.lp && !a.lp.startsWith("/")) a.lp = undefined;
    return Object.values(a).some(Boolean) ? a : null;
  } catch { return null; }
}

/** Nhãn nguồn để thống kê: utm_source → tên miền giới thiệu → "trực tiếp". */
export function sourceLabel(a: Attribution | null | undefined): string {
  if (!a) return "Không rõ (trước khi có theo dõi)";
  if (a.src) return a.med ? `${a.src} / ${a.med}` : a.src;
  if (a.ref) return a.ref.replace(/^www\./, "");
  return "Trực tiếp";
}
