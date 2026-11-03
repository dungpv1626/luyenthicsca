# Đánh giá UI/UX khu quản trị theo vai trò (03/11/2026)

**Phạm vi:** 20 trang quản trị × 3 vai trò có tài khoản (Super Admin, Academic Reviewer, Sales), Super Admin cả máy tính (1440px) lẫn điện thoại (390px); đo tự động (tràn ngang, vùng bấm, nhãn biểu mẫu, tiêu đề tab, chuyển hướng khi thiếu quyền), xem trực tiếp ảnh chụp các màn chính, đọc mã luồng duyệt câu hỏi.
**Chưa làm / hạn chế:** chưa có tài khoản **Content Manager** (đánh giá qua mã và nhìn trang bằng Super Admin); đơn hàng và tư vấn đang rỗng nên **chưa kiểm chứng được luồng thật** của Sales; không bấm các hành động ghi dữ liệu (duyệt, loại, đổi vai trò…); chưa thử bằng trình đọc màn hình, thiết bị thật, hay với người dùng thật.

## Con số cần biết
- Ngân hàng: **3.471 câu đang công bố chờ giáo viên xác nhận** (1.229 do AI soạn + 2.242 từ khuôn tham số) và 31 câu chờ duyệt.
- Nếu duyệt từng câu (~1 phút/câu) thì khối AI mất khoảng **21 giờ**; khối khuôn chỉ cần duyệt **41 khuôn** (đã có trang riêng).
- Người dùng 10, đơn hàng 0, tư vấn 0, đề 109 (trong đó 93 đề theo mức, 19 đề mô phỏng).

## Vấn đề chung cho mọi vai trò
| # | Vấn đề | Bằng chứng | Đề xuất |
|---|---|---|---|
| 1 | **Khu quản trị dùng chung đầu trang và chân trang của web học viên** (menu học viên, nút "Thi thử miễn phí", chân trang cao ~400px) | Mọi ảnh chụp | Giao diện quản trị riêng: thanh trên gọn (tên vai trò, đăng xuất, "Xem trang học viên"), không chân trang |
| 2 | **Tiêu đề tab giống nhau ở mọi trang quản trị** | Đo 20 trang | Tiêu đề riêng "Duyệt câu hỏi · Quản trị" |
| 3 | **Menu 17 mục xếp phẳng**, lẫn Anh–Việt (Dashboard, Analytics, Question Bank, Mock Test, Blueprint, Leads), không nhóm, không huy hiệu số việc | Ảnh dashboard | Nhóm: Việc cần làm · Nội dung · Đề thi · Kinh doanh · Hệ thống; việt hóa; huy hiệu số (vd Duyệt câu hỏi 3.471) |
| 4 | **Vào khu không có quyền thì bị đưa im lặng về Dashboard học viên** | Reviewer vào `/admin/orders` → `/dashboard` | Trang "Bạn không có quyền vào mục này" kèm vai trò hiện tại |
| 5 | **Không có hộp thoại xác nhận** cho hành động khó hoàn tác: hoàn tiền, đổi vai trò (kể cả lên Super Admin), gỡ cả lô, công bố/gỡ đề và bài viết, xóa dữ liệu | Không có `confirm`/hộp thoại nào trong `admin/` | Hộp thoại xác nhận nêu rõ hậu quả; riêng đổi vai trò và hoàn tiền yêu cầu ghi lý do |
| 6 | **Không có nhật ký thao tác** (ai duyệt, loại, đổi vai trò, công bố, lúc nào) | Chỉ có `reviewer`, `reviewed_at` trên câu hỏi | Bảng nhật ký + trang xem theo người/ngày |
| 7 | **Danh sách dài, không phân trang/tìm kiếm.** Question Bank cắt cứng 200 câu mới nhất, cao 13.700px, tiêu đề hiện LaTeX thô (`$\mathrm{Fe}$`); Mock Test: 109 đề trong một danh sách phẳng, cao 8.300px, form tạo đề nằm trên cùng; Bộ đề theo mức 93 hàng | Ảnh chụp, mã `questions/page.tsx` | Phân trang 25–50, ô tìm kiếm, lọc theo môn/mô-đun/chủ đề/độ khó/nguồn/trạng thái, hiển thị công thức; gom đề theo mức/môn |
| 8 | **Nhãn biểu mẫu không gắn với ô nhập** | Sửa câu hỏi 15 ô, sửa trường 15, người dùng 9, bộ đề theo mức 7, mock test 6, duyệt 2, câu hỏi 2 | Gắn `htmlFor`/`id` như đã làm ở phía học viên |
| 9 | **Vùng bấm nhỏ** (nút chữ "Công bố/Gỡ", "Sửa" trong bảng) | 115 phần tử dưới 36px ở trang bộ đề theo mức, 133 ở Mock Test | Nút cao ≥ 40px |
| 10 | **"Doanh thu: Miễn phí"** khi doanh thu là 0đ | Dashboard và Analytics | Hiện "0đ" (lỗi nhãn) |
| 11 | **Điện thoại:** menu thành dải cuộn ngang bị cắt ("Khuô…") không có dấu hiệu cuộn | Ảnh mobile | Nút "Menu" mở danh sách đầy đủ |

## Super Admin
- **Dashboard nghèo:** 5 thẻ số, không có việc cần làm. Nên có: câu chờ xác nhận, báo lỗi của học sinh mới, bài blog nháp chờ duyệt, đơn chờ xác nhận, tư vấn mới, ngân sách AI còn lại ($1,7/$50); biểu đồ xu hướng ngắn.
- **Người dùng:** không hiện **email** (chỉ tên; tài khoản thiếu hồ sơ hiện "— · — · —"), không tìm kiếm, không vô hiệu hóa/xóa tài khoản, vai trò gọi bằng tiếng Anh, lưu từng dòng. Đề xuất: cột email, tìm kiếm, bộ lọc theo vai trò, nút khóa tài khoản, xác nhận khi nâng quyền.
- **Tài khoản thử lẫn tài khoản thật** trong cùng danh sách (vd "Thử nghiệm email", "Học sinh demo"); cần cờ "tài khoản thử".
- **Analytics:** tỉ lệ theo chủ đề dựa trên 1–4 lượt làm vẫn hiện đỏ "0%"; cần ngưỡng tối thiểu và ghi chú cỡ mẫu.

## Academic Reviewer (giáo viên)
- **Quy trình duyệt từng câu một**: với 1.229 câu AI + 31 câu chờ, khối lượng quá lớn. Đề xuất duyệt **theo mẫu thống kê** (rút khoảng 10–15% mỗi lô/chủ đề; nếu tỉ lệ lỗi dưới ngưỡng thì xác nhận cả lô, còn trên ngưỡng thì duyệt kỹ) — cần chủ sản phẩm chấp nhận mức rủi ro.
- **Màn hình duyệt:** ba ngôn ngữ xếp **dọc** (cuộn ~1.500px trên máy tính, ~3.000px trên điện thoại), khó so sánh Việt–Anh–Trung. Đề xuất 3 cột song song trên màn rộng; thanh nút Duyệt/Loại **cố định ở đáy** trên điện thoại (hiện nằm cuối trang).
- **Thiếu thông tin ra quyết định:** không hiện mô-đun đề cương, khuôn sinh câu, số lượt học sinh làm và tỉ lệ đúng, các câu tương tự.
- **Bộ lọc nghèo:** chỉ môn và kết quả kiểm tra AI. Thêm: mô-đun, chủ đề, độ khó, nguồn, lô.
- **Không giới hạn theo môn:** giáo viên Toán thấy và duyệt được cả Hóa. Nên gán môn phụ trách cho từng giáo viên và mặc định lọc theo môn đó.
- **Thiếu tiến độ:** không có "đã duyệt hôm nay / còn lại", không có phím tắt (Duyệt, Loại, Bỏ qua).
- **Dashboard hiện số liệu không liên quan và nhạy cảm**: doanh thu, đơn hàng, số người dùng. Nên ẩn khỏi vai trò này và thay bằng "việc của tôi".

## Content Manager *(đánh giá qua mã, chưa có tài khoản để thử)*
- Quản lý đề, khóa học, bài giảng, blog, trường, học bổng. Điểm tốt: trang Blog SEO có chặn công bố bài còn chỗ cần xác minh, hiển thị độ dài title/meta.
- Trang **Mock Test** khó dùng (xem mục chung #7), form "Tạo đề (random câu từ ngân hàng đã duyệt)" không giải thích; còn lẫn đề cũ "Mock Test mẫu #1"; chưa có nút **xem trước đề như học viên**.
- Blueprint và mô-đun đề cương chỉ chỉnh được trong mã (`syllabus.ts`), chưa có giao diện.

## Sales/Consultant *(đơn hàng và tư vấn đang rỗng nên chưa kiểm chứng luồng thật)*
- Có đủ: Đơn hàng, Người dùng, Tư vấn (leads), Trường/Học bổng, Analytics.
- Đề xuất cho luồng thật: leads thành **hàng đợi có trạng thái** (mới/đã liên hệ/đóng), người phụ trách, ghi chú, nhắc việc, nút gọi/Zalo; đơn hàng tìm nhanh theo mã `LTC…`, có trạng thái "chuyển thiếu tiền/sai nội dung" để đối soát; hoàn tiền phải xác nhận và ghi lý do; trang chi tiết học viên (mục tiêu, bài đã làm, điểm yếu) để tư vấn đúng.

## Thứ tự đề xuất
1. **Nhanh, rủi ro thấp (1–2 ngày):** sửa "Miễn phí" thành "0đ", tiêu đề trang quản trị, hộp thoại xác nhận hành động nguy hiểm, trang "không có quyền", nhãn biểu mẫu, vùng bấm 40px, việt hóa menu, ẩn doanh thu khỏi giáo viên.
2. **Ảnh hưởng lớn (3–5 ngày):** layout quản trị riêng có menu nhóm và huy hiệu; dashboard theo vai trò ("việc cần làm"); Question Bank có tìm kiếm, phân trang, hiển thị công thức; Người dùng có email và tìm kiếm.
3. **Quy trình duyệt (3–5 ngày):** 3 cột song song, phím tắt, bộ lọc mô-đun/chủ đề, gán môn cho giáo viên, tiến độ cá nhân, duyệt theo mẫu thống kê.
4. **Sau đó:** nhật ký thao tác, hàng đợi leads/đối soát đơn, khóa tài khoản, trang quản lý mô-đun/blueprint, thử với giáo viên và tư vấn viên thật.

---
## Tình trạng xử lý nhóm 1 (cập nhật sau khi làm)
| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| "Doanh thu: Miễn phí" → "0đ" | Xong | `money()` cho số tiền, `vnd()` chỉ cho giá bán |
| Tiêu đề tab từng trang quản trị | Xong | "Tên trang – Quản trị · CSCA Việt Nam" |
| Hộp thoại xác nhận | Xong | Hoàn tiền, hủy đơn, xác nhận thu tiền, đổi vai trò (cảnh báo thêm khi lên Super Admin), công bố/gỡ đề, gỡ cả lô, xóa dữ liệu, duyệt/loại khuôn, lên lịch/công bố/gỡ bài blog. Chưa bắt buộc nhập lý do và chưa có nhật ký |
| Trang "không có quyền" | Xong | `/khong-co-quyen`, nêu vai trò hiện tại và mục bị chặn |
| Nhãn biểu mẫu | Xong | Đo lại: không còn ô thiếu nhãn ở trang quản trị (trừ 0) |
| Vùng bấm | Xong một phần | Trang bộ đề theo mức và đề thi từ 115/133 xuống ~26/24 phần tử nhỏ (phần còn lại chủ yếu là menu của web học viên); tab và liên kết ở duyệt câu hỏi, blog ≥ 40px |
| Việt hóa menu, tiêu đề, vai trò, trạng thái đơn | Xong | Vai trò: Quản trị cấp cao, Quản lý nội dung, Giáo viên duyệt chuyên môn, Tư vấn / Kinh doanh, Học viên |
| Dashboard theo vai trò | Xong | Giáo viên chỉ thấy số liệu nội dung (không thấy doanh thu/đơn hàng); Tư vấn chỉ thấy kinh doanh; thẻ có liên kết và tô nổi việc tồn đọng |
| Hộp thoại phủ cả màn hình | Xong (lỗi phát hiện khi làm) | Hộp thoại bị hiệu ứng chuyển trang giới hạn trong vùng nội dung; sửa bằng cách hiển thị ngoài khung đó, cả ở hộp thoại nộp bài của học viên |

**Chưa làm (nhóm 2–4):** layout quản trị riêng, menu nhóm có huy hiệu, Question Bank có tìm kiếm/phân trang/hiển thị công thức, Người dùng có email, quy trình duyệt cho giáo viên, nhật ký thao tác, leads/đơn hàng.
