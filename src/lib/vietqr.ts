import { BANK } from "./company";

/** Mã ngân hàng (BIN) theo chuẩn VietQR/NAPAS: 970422 = MB (Ngân hàng TMCP Quân đội). */
const BANK_BIN = "970422";
/** Tên chủ tài khoản in trên mã QR: không dấu, viết hoa (VietQR không nhận tiếng Việt có dấu). */
const QR_NAME = "CONG TY TNHH NOVAPATH GLOBAL";

/** Ảnh VietQR chuyển khoản (img.vietqr.io) – nội dung chuyển khoản = mã đơn hàng. Tài khoản lấy từ Chính sách thanh toán (lib/company). */
export function vietQrUrl(amount: number, code: string) {
  const acc = BANK.accountNo.replace(/\s/g, "");
  return `https://img.vietqr.io/image/${BANK_BIN}-${acc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}&accountName=${encodeURIComponent(QR_NAME)}`;
}
