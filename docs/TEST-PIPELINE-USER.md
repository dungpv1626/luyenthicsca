# TEST TÍNH NĂNG – PIPELINE NGƯỜI DÙNG (Luyenthicsca)

**Địa chỉ:** https://luyenthicsca.automkt.workers.dev
**Cách dùng:** làm lần lượt từng bước, đánh dấu ✅ đạt / ❌ lỗi, ghi chú nếu lỗi (chụp màn hình + ghi bước số mấy).
**Nên mở:** 1 cửa sổ thường (học sinh) + 1 cửa sổ ẩn danh (admin/giáo viên) để đăng nhập hai vai trò cùng lúc.

> Không ghi mật khẩu vào file này. Tài khoản đã được gửi riêng; chỗ nào ghi `‹admin›` `‹giáo viên›` `‹học sinh›` là tài khoản theo vai trò đó.

---

## 0. Chuẩn bị
| # | Việc | Kết quả mong đợi | ✔ |
|---|---|---|---|
| 0.1 | Mở trang chủ khi chưa đăng nhập | Hero "Bạn đã sẵn sàng thi CSCA?", thẻ xem trước Readiness Score, các khối Quy trình / Mock Test / Trường | ☐ |
| 0.2 | Thu nhỏ trình duyệt ≈ 390px (hoặc dùng điện thoại) | Không bị tràn ngang; có menu ☰ và thanh điều hướng dưới (Trang chủ, Thi thử, Luyện tập, AI, Tôi) | ☐ |

---

## PIPELINE A – HỌC SINH (luồng chính)
`Khách → Đăng ký → Quick Test → Kết quả + AI → Hồ sơ AI → Lộ trình → Nhiệm vụ → Luyện câu sai → Gia sư → Trường/Tư vấn → Mua đề → Mock Test → Academy`

### A1. Đăng ký / đăng nhập
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A1.1 | Bấm **Thi thử miễn phí** khi chưa đăng nhập | Dẫn tới trang yêu cầu **Đăng ký / Đăng nhập** | ☐ |
| A1.2 | Đăng ký tài khoản mới (họ tên, đối tượng, mục tiêu, ngày thi, email, mật khẩu ≥ 8 ký tự) | Vào được app (hoặc báo cần xác nhận email nếu bật Confirm email) | ☐ |
| A1.3 | Đăng xuất (menu avatar góc phải → **Đăng xuất**) rồi đăng nhập lại | Đăng nhập được, tên hiển thị đúng | ☐ |
| A1.4 | Đăng nhập sai mật khẩu | Báo "Email hoặc mật khẩu không đúng", **email vẫn còn trong ô** | ☐ |
| A1.5 | Đăng ký với mật khẩu < 8 ký tự | Báo "Mật khẩu tối thiểu 8 ký tự", các ô khác giữ nguyên | ☐ |

### A2. Quick Test (20 câu / 15 phút)
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A2.1 | `/quick-test` → **Bắt đầu làm bài** | Vào phòng thi, có đồng hồ đếm ngược, bảng số câu bên phải | ☐ |
| A2.2 | Chọn đáp án, chuyển câu bằng **Câu trước / Câu sau** và bấm số trong bảng | Câu đã trả lời đổi màu đỏ; đếm "Đã trả lời x/y" đúng | ☐ |
| A2.3 | Nếu câu có bản dịch: bấm **English / 中文 / Tiếng Việt** | Nội dung đổi ngôn ngữ, đáp án đã chọn giữ nguyên; tải lại trang vẫn nhớ ngôn ngữ | ☐ |
| A2.4 | Câu có công thức | Công thức hiển thị đẹp (không hiện ký tự `$...$` thô) | ☐ |
| A2.5 | **Tải lại trang giữa chừng** (F5) | Bài làm và đáp án đã chọn vẫn còn, đồng hồ không reset | ☐ |
| A2.6 | Bấm **Nộp bài** → xác nhận | Nút hiện "Đang chấm điểm & phân tích…", sau vài giây chuyển sang trang kết quả | ☐ |
| A2.7 | (Tùy chọn) Để hết giờ mà không nộp | Hệ thống tự nộp khi về 00:00 | ☐ |

### A3. Kết quả & phân tích AI
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A3.1 | Xem đầu trang kết quả | Vòng **Readiness Score /100**, số câu đúng, độ chính xác, tốc độ | ☐ |
| A3.2 | Xem "Kết quả theo môn" | Mỗi môn có thanh % và số đúng/tổng | ☐ |
| A3.3 | Xem khối **Phân tích AI** | Có tóm tắt, điểm mạnh, cần cải thiện, việc nên làm. Nếu ghi "(tự động)" nghĩa là đang dùng báo cáo dự phòng (AI lỗi/chưa cấu hình) → ghi lại | ☐ |
| A3.4 | **Xem lại từng câu**: đáp án đúng tô xanh, câu sai tô đỏ, có 💡 giải thích | Chữ cái đáp án trong lời giải **khớp** đáp án hiển thị | ☐ |
| A3.5 | Đổi **Tiếng Việt / English / 中文** ở mục xem lại | Đề, đáp án, giải thích đổi theo ngôn ngữ | ☐ |
| A3.6 | Mở **Hỏi Gia sư AI về câu này** → bấm gợi ý hoặc tự gõ | Có câu trả lời từng bước, đúng ngôn ngữ đã hỏi | ☐ |

### A4. Hồ sơ AI & Dashboard
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A4.1 | `/ai` | Readiness, biểu đồ tiến bộ, kỹ năng theo môn, bản đồ kỹ năng theo chủ đề (yếu nhất trước) | ☐ |
| A4.2 | `/dashboard` | Điểm sẵn sàng, mục tiêu, điểm yếu hàng đầu, bài làm gần đây | ☐ |
| A4.3 | Làm thêm 1 bài rồi xem lại biểu đồ | Có thêm điểm mới, hiện "▲/▼ so với lần trước" | ☐ |

### A5. Lộ trình học (AI Study Plan)
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A5.1 | `/lo-trinh` → chọn thời gian, phút/ngày, mục tiêu → **Tạo lộ trình bằng AI** | Hiện lịch tuần với các nhiệm vụ theo ngày; cuối trang ghi nguồn "AI (Claude)" hoặc "hệ thống (theo luật)" | ☐ |
| A5.2 | Xem khối Tiến độ / Mục tiêu / Quá hạn | Số liệu hợp lý (0% khi mới tạo) | ☐ |
| A5.3 | Bấm ← / → để xem tuần khác; mục **Sắp tới** | Hiện đúng nhiệm vụ các ngày sau | ☐ |
| A5.4 | Ở nhiệm vụ của hôm nay bấm **Làm ngay** | Vào phòng thi với đúng chủ đề của nhiệm vụ | ☐ |
| A5.5 | Nộp bài nhiệm vụ → quay lại `/lo-trinh` | Nhiệm vụ đó **tự hoàn thành** (gạch ngang, dấu ✓), Tiến độ tăng | ☐ |
| A5.6 | Bấm dấu tròn ✓ để tự đánh dấu / bỏ đánh dấu | Trạng thái đổi đúng | ☐ |
| A5.7 | `/dashboard` → khối **Nhiệm vụ hôm nay** | Hiện đúng các nhiệm vụ chưa làm; **Làm ngay** hoạt động | ☐ |

### A6. Luyện tập & câu đã sai
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A6.1 | `/luyen-tap` → chọn môn / chủ đề / độ khó / số câu → **Bắt đầu luyện tập** | Vào phòng thi luyện tập đúng bộ lọc (hoặc báo "chưa có câu phù hợp") | ☐ |
| A6.2 | Sau khi có câu sai, mở lại `/luyen-tap` | Khối **Câu đã sai** hiện số câu, nút **Luyện lại tối đa 20 câu** bật | ☐ |
| A6.3 | Bấm luyện lại câu sai | Chỉ gồm các câu từng sai | ☐ |

### A7. Gia sư AI
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A7.1 | `/gia-su` → bấm một câu gợi ý | Có câu trả lời; hiện "Còn x lượt hỏi hôm nay" | ☐ |
| A7.2 | Hỏi bằng tiếng Anh / tiếng Trung | Trả lời theo ngôn ngữ đó | ☐ |
| A7.3 | Hỏi nội dung ngoài CSCA (vd: công thức nấu ăn) | Từ chối lịch sự, đưa về học tập | ☐ |

### A8. Trường, học bổng, tư vấn
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A8.1 | `/truong` → lọc theo tên / thành phố | Danh sách lọc đúng | ☐ |
| A8.2 | Tick **So sánh** ở 2–3 trường → **So sánh các trường đã chọn** | Bảng so sánh các trường (mức chuẩn ghi "Đang cập nhật" nếu chưa nhập) | ☐ |
| A8.3 | Mở chi tiết một trường | Có Yêu cầu CSCA, Ngành, Học bổng liên quan, form tư vấn | ☐ |
| A8.4 | (Cần admin nhập mức chuẩn trước – xem B6) Xem phần đánh giá hồ sơ | Hiện "Chuẩn x% · Bạn y%" và thiếu/đạt | ☐ |
| A8.5 | Nhập số điện thoại + nội dung → **Gửi yêu cầu tư vấn** | Báo "Đã gửi yêu cầu"; yêu cầu xuất hiện ở Admin → Tư vấn / Leads | ☐ |
| A8.6 | `/hoc-bong` | Danh sách học bổng, hạn nộp, quyền lợi | ☐ |

### A9. Thi thử có phí & thanh toán
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A9.1 | `/thi-thu` → **Mock Test mẫu #1** → **Xem đề** | Trang chi tiết, giá **49.000đ**, nút **Mua đề** | ☐ |
| A9.2 | Bấm **Mua đề** | Tạo đơn, trang thanh toán có mã chuyển khoản dạng `LTCxxxxxx` (và ảnh VietQR **nếu đã cấu hình ngân hàng**) | ☐ |
| A9.3 | `/don-hang` | Đơn hiện trạng thái **Chờ thanh toán** | ☐ |
| A9.4 | Admin xác nhận đơn (xem B5) → học sinh tải lại trang thanh toán | Đổi sang **Đã thanh toán**, có nút **Làm bài ngay** | ☐ |
| A9.5 | Vào làm đề đã mua | Làm được, nộp bài có kết quả + AI như A3 | ☐ |
| A9.6 | Thử vào thẳng link đề trả phí bằng tài khoản **chưa mua** | Không làm được, bị đưa về trang mua | ☐ |

### A10. Academy
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| A10.1 | `/academy` → mở khóa **Làm quen CSCA (khóa mẫu)** | Thấy giáo viên, danh sách bài, nút **Bắt đầu học** | ☐ |
| A10.2 | Mở một bài | Hiện nội dung; nếu có quiz thì có nút **Làm quiz** | ☐ |
| A10.3 | **Đánh dấu hoàn thành** | Nút đổi thành "✓ Đã hoàn thành"; `/khoa-hoc-cua-toi` hiện tiến độ % tăng | ☐ |
| A10.4 | Bấm **Làm quiz** | Vào luyện tập đúng môn/chủ đề của bài | ☐ |

---

## PIPELINE B – GIÁO VIÊN / ADMIN
`Đăng nhập → Blueprint → Duyệt câu hỏi → Tạo & publish đề → Đơn hàng → Leads → Dữ liệu trường/khóa học → Analytics → Phân quyền`

| # | Thao tác (dùng `‹admin›` hoặc `‹giáo viên›`) | Kết quả mong đợi | ✔ |
|---|---|---|---|
| B1 | Đăng nhập → vào **Admin** từ menu avatar | Thấy menu bên trái: Dashboard, Analytics, Duyệt câu hỏi, Blueprint, Question Bank, … | ☐ |
| B2 | **Blueprint** | 4 môn, mỗi môn mục tiêu 300 câu; bảng theo chủ đề × độ khó, có cột Đã duyệt / Chờ duyệt / Bị loại | ☐ |
| B3 | **Duyệt câu hỏi** | Hàng chờ hiện số câu; câu có cờ (lệch đáp án / lỗi cấu trúc) hiện đầu; xem đủ 3 ngôn ngữ, công thức hiển thị đẹp | ☐ |
| B3a | Bấm **Loại** khi để trống ghi chú | Bị chặn: "Cần nhập lý do khi loại câu" | ☐ |
| B3b | Nhập lý do → **Loại** | Câu biến khỏi hàng chờ, Blueprint tăng cột "Bị loại" | ☐ |
| B3c | Bấm **Duyệt** (tài khoản Academic Reviewer / Super Admin) | Câu thành Đã duyệt; Blueprint tăng cột "Đã duyệt"; học sinh có thể gặp câu này khi luyện tập | ☐ |
| B3d | Bấm **Sửa câu hỏi** → chỉnh bản English/中文 → Lưu | Thay đổi được lưu, hiển thị ở màn hình duyệt | ☐ |
| B4 | **Mock Test** → nhập tên, giá, số câu mỗi môn → **Tạo đề** → **Publish** | Đề hiện ở `/thi-thu`; báo lỗi nếu không đủ câu đã duyệt | ☐ |
| B5 | **Đơn hàng** → đơn chờ thanh toán → **Xác nhận đã thu** | Đơn chuyển "paid"; học sinh mở khóa đề (A9.4) | ☐ |
| B5a | **Hoàn tiền / Hủy** đơn | Trạng thái đổi; học sinh mất quyền truy cập đề đã hoàn | ☐ |
| B6 | **Trường** → Sửa → nhập mức chuẩn Toán/Vật lý, ngành → Lưu | Trang trường của học sinh hiện đánh giá hồ sơ (A8.4) | ☐ |
| B7 | **Tư vấn / Leads** (cũng thử bằng tài khoản Sales) | Thấy yêu cầu A8.5; đổi trạng thái "Đã liên hệ" / "Đã đóng" | ☐ |
| B8 | **Khóa học / Bài giảng / Giáo viên** → thêm mới, sửa, xóa | Lưu được; khóa **Công bố** thì hiện ở `/academy` | ☐ |
| B9 | **Analytics** | Biểu đồ 30 ngày, phễu chuyển đổi, câu hỏi cần rà soát, độ chính xác theo chủ đề | ☐ |
| B10 | **Người dùng** (Super Admin) | Đổi được vai trò; không tự đổi vai trò của chính mình | ☐ |

---

## PIPELINE C – BẢO MẬT & TRƯỜNG HỢP BIÊN
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| C1 | Đăng nhập bằng `‹học sinh›`, gõ thẳng `/admin` | Bị đưa về `/dashboard` | ☐ |
| C2 | Tài khoản Sales vào `/admin/data/courses` hoặc Duyệt câu hỏi | Bị chặn (chỉ Super Admin / Content) | ☐ |
| C3 | Trong phòng thi: chuột phải → **Xem nguồn trang** (hoặc DevTools → Network) | **Không** thấy đáp án đúng hay lời giải trong dữ liệu trang | ☐ |
| C4 | Chưa đăng nhập, mở `/dashboard`, `/lo-trinh`, `/thi/...` | Bị đưa tới trang đăng nhập, sau đăng nhập quay lại đúng trang | ☐ |
| C5 | Dùng tài khoản A mở link kết quả `/ket-qua/...` của tài khoản B | Không xem được (404) | ☐ |
| C6 | Nộp bài hai lần liên tiếp (bấm nhanh / mở 2 tab) | Chỉ chấm một lần, kết quả không đổi | ☐ |
| C7 | Hỏi Gia sư AI quá 30 lượt/ngày | Báo hết lượt, hẹn ngày mai | ☐ |
| C8 | Webhook thanh toán – sai khóa | HTTP **401** | ☐ |
| C9 | Webhook – đúng khóa nhưng **thiếu tiền** | `matched:false`, đơn vẫn chờ thanh toán | ☐ |
| C10 | Webhook – đúng khóa, **đủ tiền**, nội dung có mã đơn | `matched:true`, đơn thành đã thanh toán | ☐ |

Lệnh thử webhook (thay `<KHOA>` và `<MA_DON>`):
```bash
curl -X POST https://luyenthicsca.automkt.workers.dev/api/payment/webhook \
  -H "Authorization: Apikey <KHOA>" -H "Content-Type: application/json" \
  -d '{"content":"CK <MA_DON>","transferAmount":49000,"transferType":"in"}'
```

---

## PIPELINE D – GIAO DIỆN & ĐA NGÔN NGỮ
| # | Thao tác | Kết quả mong đợi | ✔ |
|---|---|---|---|
| D1 | Điện thoại (≈390px): làm hết một bài thi | Bảng câu, đồng hồ, nút **Nộp bài** dùng được, không tràn | ☐ |
| D2 | Máy tính bảng / laptop nhỏ (≈1024px) | Thanh menu không bị xuống dòng chữ | ☐ |
| D3 | Chuyển Việt/Anh/Trung ở câu có chữ Hán | Chữ Hán hiển thị đúng, không lỗi font | ☐ |
| D4 | Mở menu avatar | Có Dashboard, Lộ trình, Khóa học, Đơn hàng, Đăng xuất (và Quản trị nếu là staff) | ☐ |

---

## GHI LỖI
| Bước | Mô tả lỗi | Mức độ (Chặn / Nặng / Nhẹ) | Ảnh chụp | Trình duyệt / thiết bị |
|---|---|---|---|---|
| | | | | |

## Giới hạn đã biết (không tính là lỗi)
- **Chưa có "Đổi mật khẩu" / "Quên mật khẩu"** trong app.
- **Chưa có Blog**, lịch học trực tuyến, Mobile App, API.
- **Ảnh VietQR** chỉ hiện đúng khi đã cấu hình số tài khoản ngân hàng.
- **Ngân hàng câu hỏi hiện nhỏ:** chỉ 20 câu mẫu đã duyệt (chưa có bản Anh/Trung); các câu mới do AI soạn **chờ giáo viên duyệt** nên học sinh chưa thấy. Vì vậy A2.3 (đổi ngôn ngữ trong bài) chỉ kiểm tra được sau khi có câu đã duyệt kèm bản dịch.
- **Readiness Score** là chỉ số ước lượng, không phải điểm CSCA chính thức.
- Trang **Trường** chưa có mức chuẩn CSCA cho tới khi admin nhập từ thông báo chính thức.
