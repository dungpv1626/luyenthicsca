# Đánh giá UI/UX cửa sổ học viên (02/11/2026)

**Phạm vi:** 18 trang học viên × 2 cỡ màn hình (1440×900 và 390×844) bằng trình duyệt thật (tài khoản học viên demo), cộng luồng thi thử → nộp bài → xem kết quả, cộng đọc mã nguồn các thành phần chính.
**Chưa làm:** thử trên thiết bị thật, trong trình duyệt nhúng của Zalo/Facebook, kiểm tra bằng trình đọc màn hình, đo hiệu năng từ Việt Nam, thử với học sinh thật.

## Điểm tốt
- 36/36 lượt tải trang: không tràn ngang, mỗi trang đúng 1 `h1`, 0 lỗi console, không ảnh hỏng.
- Phòng thi: đổi ngôn ngữ Việt/Anh/Trung, đồng hồ cố định, bảng số câu, công thức hiển thị đẹp, tự nộp khi hết giờ, lưu đáp án tạm trên máy khi tải lại.
- Giao diện nhất quán, hero và trang chủ có sức hút.

## Lỗi cần sửa (P0)
| # | Vấn đề | Bằng chứng | Đề xuất |
|---|---|---|---|
| 1 | Trang kết quả hiện nguyên mã công thức ở các lựa chọn A–D (`$6\sqrt2$`) | Ảnh chụp kết quả; mã `ket-qua/[attemptId]/page.tsx` | **ĐÃ SỬA** (bọc `Rich`) |
| 2 | Tiêu đề tab của **mọi trang giống nhau** ("Luyenthicsca – Đánh giá & nâng cao…"), khác tên thương hiệu trên logo (CSCA Việt Nam) | Đo trên 18 trang | Đặt `metadata.title` riêng cho từng trang, mẫu "Tên trang · CSCA Việt Nam" |
| 3 | Nút nộp bài dùng hộp thoại `confirm()` của trình duyệt, chỉ nói "Nộp bài?" | `ExamRunner.tsx` dòng 88, 98 | Hộp thoại riêng: số câu đã làm / chưa làm / đã đánh dấu, thời gian còn lại. Trình duyệt nhúng (Zalo, Facebook) có thể chặn `confirm()` làm nút "không phản hồi" — **chưa kiểm tra trên thiết bị thật** |
| 4 | Đáp án đang làm chỉ lưu trên **trình duyệt của máy đó**; đổi máy/xóa dữ liệu là mất | `localStorage` trong `ExamRunner.tsx`; trình duyệt mới mở lại cùng bài hiện 0/60 | Lưu nháp lên máy chủ mỗi 15–30 giây hoặc khi đổi câu |

## Trải nghiệm (P1)
| # | Vấn đề | Đề xuất |
|---|---|---|
| 5 | Trang kết quả dài **20.107px (máy tính) / 32.447px (điện thoại)** vì mở sẵn cả 60 câu | Bộ lọc "Chỉ câu sai / Chưa làm / Tất cả", thu gọn từng câu, nút nổi "Lên đầu", đặt hành động tiếp theo (luyện câu sai, tạo lộ trình) ngay dưới điểm |
| 6 | Bài nộp trống (0/60) vẫn có "Readiness 0" và phân tích AI dài, nghe như thật | Dưới ~20% số câu: không chấm Readiness, không gọi AI (tiết kiệm chi phí), hiện thông báo "Bạn chưa làm đủ để phân tích" |
| 7 | `/thi-thu` trên điện thoại: 22 thẻ gần giống nhau (~6.600px), mô tả lặp, không có trạng thái "đã làm / đang làm dở / điểm" | Gom theo môn (tab hoặc thu gọn), huy hiệu trạng thái và điểm cũ, một thẻ "Đề nên làm tiếp" đặt trên cùng |
| 8 | Dashboard học viên mới: ba ô "Chưa có…", ô "Mục tiêu & kỳ thi" lại dẫn tới "Đơn hàng của tôi" | Danh sách việc cần làm 3 bước (Quick Test → đặt mục tiêu → tạo lộ trình) và **một** nút chính; ô mục tiêu có nút "Đặt mục tiêu" |
| 9 | Phòng thi: vẫn hiện thanh menu, chân trang và thanh điều hướng dưới nên dễ bấm nhầm rời bài; không có "đánh dấu xem lại"; nút Nộp bài nằm cuối trang trên điện thoại; chưa thấy cảnh báo khi đóng tab | Chế độ tập trung: ẩn menu/chân trang, thanh dưới cố định (Trước / Sau / Danh sách câu / Nộp bài), nút cờ, cảnh báo khi rời. Bảng số câu: cần xác nhận lại màu "đã trả lời" so với "chưa" |
| 10 | Trang chi tiết đề rất trống: không có quy chế, lịch sử làm, cơ cấu môn; nút "Bắt đầu / tiếp tục" gộp hai ý | Tách "Bắt đầu" và "Tiếp tục (còn mm:ss)", thêm quy chế ngắn và lịch sử |
| 11 | Luyện tập: ô "Chủ đề" là ô nhập tự do, không gợi ý chủ đề yếu | Danh sách chủ đề thật theo môn, chip "Chủ đề nên ôn" từ điểm yếu |
| 12 | Gia sư AI trên điện thoại: chưa chắc ô nhập có bị thanh điều hướng dưới che hay không (ảnh chụp cả trang không đủ để khẳng định) | Kiểm tra trên máy thật; chừa khoảng đệm dưới ô nhập |

## Chạm và truy cập (P2)
- **Vùng bấm nhỏ** (nên ≥ 44px; hiện có): nhóm nút lọc/tab ở `/thi-thu`, `/truong`, `/hoc-bong`, `/academy` cao 34px; ô tích "So sánh" 13×13px; liên kết chữ cao 17px ("Quên mật khẩu?", "Đăng ký", "← Về Dashboard"); gợi ý của gia sư AI cao 30px.
- **Nhãn biểu mẫu không gắn với ô nhập** (thiếu `htmlFor`/`id`): 7 ô ở `/dang-ky`, 4 ở `/lo-trinh`, 3 ở `/luyen-tap`, 2 ở `/dang-nhap` → trình đọc màn hình không đọc được tên ô; bấm vào nhãn không đưa con trỏ vào ô.
- Có 7 phần tử chữ nhỏ hơn 12px trên máy tính và 11 trên điện thoại ở trang chủ.
- Ô ngày hiện `mm/dd/yyyy` theo ngôn ngữ trình duyệt; người dùng Việt quen dd/mm/yyyy.

## Hiệu năng (đo từ môi trường làm việc, không phải từ Việt Nam)
Trang thật: thời gian chờ byte đầu 0,7–1,6 giây; HTML trang chủ 213KB (khá nặng). Số đo từ máy chủ dev không có ý nghĩa nên không đưa vào. Cần đo lại bằng thiết bị và mạng của học sinh.

## Thứ tự đề xuất
1. **Tuần này (≈ 1–2 ngày):** #2 tiêu đề trang, #3 hộp thoại nộp bài, #6 chặn phân tích bài trống, nhãn biểu mẫu, vùng bấm.
2. **Tiếp theo (≈ 3–5 ngày):** #4 lưu nháp lên máy chủ, #5 kết quả gọn và có bộ lọc, #9 chế độ tập trung trong phòng thi.
3. **Sau đó:** #7, #8, #10, #11; thử với 5 học sinh thật, đo trên điện thoại cũ và mạng 4G.

---
## Tình trạng xử lý (cập nhật sau khi làm theo lộ trình đề xuất)

| # | Hạng mục | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | Công thức thô ở lựa chọn trên trang kết quả | Xong | |
| 2 | Tiêu đề từng trang | Xong | Mẫu "Tên trang · CSCA Việt Nam"; trang trường và đề lấy theo tên |
| 3 | Hộp thoại nộp bài | Xong | Hộp riêng: số câu đã làm/chưa/đánh dấu, thời gian còn lại, bấm số câu để nhảy tới |
| 4 | Lưu nháp lên máy chủ | Xong | Lưu sau mỗi lần chọn (~1,2 giây), mỗi 20 giây và khi rời tab; thử mở bài ở trình duyệt khác thấy đúng số câu đã làm. Đánh dấu "xem lại" vẫn chỉ lưu trên máy |
| 5 | Kết quả gọn | Xong | Lọc "Cần xem lại / Đúng / Tất cả", thu gọn từng câu, hành động tiếp theo đặt dưới điểm. Bài luyện 10 câu: ~5.000px trên điện thoại |
| 6 | Bài làm quá ít câu | Xong | Dưới 20% số câu: không chấm Readiness, không gọi AI, không tính vào tiến bộ; bài cũ đã được đánh dấu bằng migration 0010 |
| 7 | Trang chọn đề | Xong | Gom theo môn, trạng thái ngay trên nút (✓ điểm / ▶ đang làm / giá), thẻ "Nên làm tiếp". Trang giảm từ ~6.600px còn ~3.200px trên điện thoại |
| 8 | Dashboard người mới | Xong | Danh sách 3 bước; ô mục tiêu dẫn tới trang lộ trình |
| 9 | Phòng thi tập trung | Xong | Ẩn menu/chân trang; thanh dưới cố định trên điện thoại; bảng câu dạng cửa sổ trượt lên; nút đánh dấu xem lại; cảnh báo khi đóng tab nếu chưa lưu; nút Thoát |
| 10 | Chi tiết đề | Xong | Cơ cấu môn/độ khó, quy chế, lịch sử làm bài, nút Bắt đầu / Tiếp tục (còn mm:ss) / Làm lại |
| 11 | Luyện tập | Xong | Chủ đề là danh sách theo môn đã chọn; thẻ "Chủ đề nên ôn" từ điểm yếu |
| 12 | Nhãn biểu mẫu, vùng bấm | Xong | 16 ô gắn nhãn; nút/liên kết trên điện thoại ≥ 44px. Đo lại: không còn ô thiếu nhãn |
| – | Trang 404 | Xong (thêm) | Trang riêng bằng tiếng Việt |

**Còn lại / chưa kiểm chứng:** Gia sư AI trên điện thoại (ô nhập có bị thanh dưới che không), trình duyệt nhúng Zalo/Facebook, trình đọc màn hình, thiết bị thật, 5 học sinh thật. Một số chữ nhỏ hơn 12px (nhãn trang trí, chú thích) trên trang chủ và dashboard chưa đổi.
