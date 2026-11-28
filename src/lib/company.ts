// Thông tin doanh nghiệp công bố trên website (chân trang, trang chính sách, trang thanh toán).
// PHẢI khớp tờ khai với Bộ Công Thương (Phiếu thông tin Mẫu 01) và các văn bản chính sách.
export const COMPANY = {
  name: "CÔNG TY TNHH NOVAPATH GLOBAL",
  shortName: "NovaPath Global",
  brand: "CSCA VIỆT NAM",
  taxCode: "0111590890",
  address: "Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Thành phố Hà Nội",
  representative: "Ông Đặng Xuân Phi – Giám đốc",
  phone: "0705 537 538",
  phoneHref: "0705537538",
  email: "cscavietnam@gmail.com",
  hours: "8:00–17:30, thứ Hai đến thứ Bảy",
} as const;

/** Tài khoản nhận chuyển khoản, theo Chính sách thanh toán. Mã ngân hàng dùng cho VietQR lấy từ biến môi trường. */
export const BANK = {
  bankName: "MBBANK (Ngân hàng TMCP Quân đội) – Chi nhánh Gia Lâm",
  accountNo: "535 368 368",
  accountName: "CÔNG TY TNHH NOVAPATH GLOBAL",
} as const;
