/** Ảnh VietQR chuyển khoản (img.vietqr.io) – nội dung chuyển khoản = mã đơn hàng. */
export function vietQrUrl(amount: number, code: string) {
  const bank = process.env.PAYMENT_BANK_ID ?? "";
  const acc = process.env.PAYMENT_ACCOUNT_NO ?? "";
  const name = encodeURIComponent(process.env.PAYMENT_ACCOUNT_NAME ?? "");
  return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(code)}&accountName=${name}`;
}
