// Nội dung 9 văn bản chính sách, chuyển từ Chinh_sach_rieng/*.docx. Phải khớp bản đã khai với Bộ Công Thương.
// Sửa nội dung: sửa file Word rồi sinh lại (README, mục Chính sách và tờ khai Bộ Công Thương) hoặc sửa trực tiếp tại đây.
export type PolicyBlock = { t: "h"; text: string } | { t: "p"; text: string } | { t: "ul"; items: string[] } | { t: "table"; rows: string[][] };
export type Policy = { num: string; slug: string; title: string; blocks: PolicyBlock[] };

export const POLICY_UPDATED = "26/11/2026";

export const POLICIES: Policy[] = [
 {
  "num": "01",
  "slug": "chinh-sach-bao-mat",
  "title": "Chính sách bảo mật thông tin cá nhân",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "p",
    "text": "Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của người dùng khi sử dụng website luyenthicsca.edu.vn, theo quy định pháp luật Việt Nam về bảo vệ dữ liệu cá nhân và thương mại điện tử."
   },
   {
    "t": "h",
    "text": "1. Thông tin của đơn vị thu thập dữ liệu"
   },
   {
    "t": "p",
    "text": "Đơn vị: Công ty TNHH NovaPath Global. Địa chỉ: Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội."
   },
   {
    "t": "p",
    "text": "Đầu mối tiếp nhận yêu cầu về dữ liệu cá nhân: điện thoại/Zalo 0705 537 538; email cscavietnam@gmail.com."
   },
   {
    "t": "h",
    "text": "2. Nguyên tắc bảo vệ dữ liệu cá nhân"
   },
   {
    "t": "p",
    "text": "– Chỉ thu thập dữ liệu cần thiết cho mục đích đã công bố."
   },
   {
    "t": "p",
    "text": "– Chỉ sử dụng dữ liệu đúng mục đích; không bán dữ liệu cá nhân cho bên thứ ba."
   },
   {
    "t": "p",
    "text": "– Không chia sẻ dữ liệu khi không có căn cứ pháp lý hoặc sự đồng ý của người dùng."
   },
   {
    "t": "p",
    "text": "– Áp dụng biện pháp bảo vệ phù hợp và tôn trọng quyền của chủ thể dữ liệu."
   },
   {
    "t": "h",
    "text": "3. Mục đích thu thập thông tin"
   },
   {
    "t": "p",
    "text": "– Tạo và quản lý tài khoản người dùng."
   },
   {
    "t": "p",
    "text": "– Cung cấp bài thi thử, chấm điểm, phân tích kết quả, xây dựng lộ trình học và hỗ trợ học tập qua gia sư AI."
   },
   {
    "t": "p",
    "text": "– Xác nhận đơn hàng, xử lý thanh toán, kích hoạt gói dịch vụ, xuất hóa đơn khi có yêu cầu."
   },
   {
    "t": "p",
    "text": "– Hỗ trợ khách hàng, tiếp nhận và giải quyết phản ánh, khiếu nại."
   },
   {
    "t": "p",
    "text": "– Phòng ngừa gian lận, chia sẻ tài khoản trái phép và bảo đảm an toàn hệ thống."
   },
   {
    "t": "p",
    "text": "– Thực hiện nghĩa vụ theo quy định pháp luật."
   },
   {
    "t": "p",
    "text": "– Gửi thông tin khuyến mại, tư vấn du học chỉ khi người dùng đồng ý."
   },
   {
    "t": "h",
    "text": "4. Phạm vi thông tin được thu thập"
   },
   {
    "t": "p",
    "text": "– Thông tin nhận dạng: họ tên, lớp/trình độ học."
   },
   {
    "t": "p",
    "text": "– Thông tin tài khoản: email, số điện thoại, tên đăng nhập, mật khẩu (được mã hóa)."
   },
   {
    "t": "p",
    "text": "– Thông tin đơn hàng: gói dịch vụ đã chọn, thời điểm mua, mã giao dịch, thông tin xuất hóa đơn (nếu yêu cầu)."
   },
   {
    "t": "p",
    "text": "– Thông tin học tập: kết quả làm bài, tiến độ, lịch sử sử dụng dịch vụ."
   },
   {
    "t": "p",
    "text": "– Thông tin thanh toán: do ngân hàng/cổng thanh toán xử lý; website không lưu số thẻ ngân hàng."
   },
   {
    "t": "p",
    "text": "– Dữ liệu kỹ thuật: địa chỉ IP, loại thiết bị, trình duyệt, nhật ký truy cập."
   },
   {
    "t": "p",
    "text": "– Thông tin liên lạc: nội dung người dùng gửi khi liên hệ hỗ trợ hoặc khiếu nại."
   },
   {
    "t": "h",
    "text": "5. Những tổ chức, cá nhân có thể được tiếp cận thông tin"
   },
   {
    "t": "p",
    "text": "– Bộ phận nội bộ của NovaPath Global được giao nhiệm vụ vận hành, chăm sóc khách hàng và kế toán."
   },
   {
    "t": "p",
    "text": "– Ngân hàng, tổ chức cung ứng dịch vụ thanh toán xử lý giao dịch của người dùng."
   },
   {
    "t": "p",
    "text": "– Đơn vị cung cấp hạ tầng máy chủ, lưu trữ, email, công nghệ phục vụ trực tiếp việc vận hành website, theo cam kết bảo mật."
   },
   {
    "t": "p",
    "text": "– Cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp."
   },
   {
    "t": "p",
    "text": "– Bên thứ ba khác chỉ khi người dùng đồng ý."
   },
   {
    "t": "h",
    "text": "6. Chuyển dữ liệu ra nước ngoài"
   },
   {
    "t": "p",
    "text": "Một số dịch vụ hạ tầng hoặc công cụ phân tích có thể lưu trữ dữ liệu ở máy chủ ngoài lãnh thổ Việt Nam. Khi đó, chúng tôi chỉ chuyển phạm vi dữ liệu cần thiết cho việc vận hành dịch vụ, yêu cầu đối tác cam kết bảo mật tương đương và thực hiện thủ tục theo quy định pháp luật."
   },
   {
    "t": "h",
    "text": "7. Cookie và dữ liệu kỹ thuật"
   },
   {
    "t": "p",
    "text": "Website sử dụng cookie và bộ nhớ cục bộ của trình duyệt để duy trì đăng nhập, ghi nhớ thiết lập và đo lường mức độ sử dụng. Người dùng có thể tắt hoặc xóa cookie trong trình duyệt; việc này có thể làm một số chức năng (như đăng nhập) không hoạt động đầy đủ."
   },
   {
    "t": "h",
    "text": "8. Thời gian lưu trữ thông tin"
   },
   {
    "t": "p",
    "text": "– Dữ liệu tài khoản và học tập được lưu trong thời gian tài khoản còn hoạt động."
   },
   {
    "t": "p",
    "text": "– Sau khi tài khoản chấm dứt, dữ liệu được lưu tối đa 05 năm phục vụ đối soát, giải quyết khiếu nại và nghĩa vụ pháp lý, sau đó xóa hoặc ẩn danh hóa."
   },
   {
    "t": "p",
    "text": "– Chứng từ kế toán, hóa đơn được lưu theo thời hạn pháp luật quy định."
   },
   {
    "t": "h",
    "text": "9. Biện pháp bảo mật"
   },
   {
    "t": "p",
    "text": "– Mã hóa kết nối HTTPS/TLS; mật khẩu được mã hóa một chiều."
   },
   {
    "t": "p",
    "text": "– Phân quyền truy cập dữ liệu nội bộ theo nhiệm vụ; ghi nhật ký truy cập hệ thống."
   },
   {
    "t": "p",
    "text": "– Sao lưu dữ liệu định kỳ."
   },
   {
    "t": "p",
    "text": "– Yêu cầu đối tác xử lý dữ liệu cam kết bảo mật."
   },
   {
    "t": "p",
    "text": "– Khi xảy ra sự cố lộ lọt dữ liệu, chúng tôi sẽ thông báo cho người dùng và cơ quan có thẩm quyền theo quy định pháp luật."
   },
   {
    "t": "h",
    "text": "10. Quyền của khách hàng đối với dữ liệu cá nhân"
   },
   {
    "t": "p",
    "text": "Người dùng có quyền: được biết dữ liệu của mình được xử lý như thế nào; truy cập, xem và chỉnh sửa; yêu cầu xóa hoặc hạn chế xử lý; rút lại sự đồng ý; phản đối việc nhận tin quảng cáo; khiếu nại và yêu cầu bồi thường theo quy định pháp luật."
   },
   {
    "t": "h",
    "text": "11. Quy trình tiếp nhận yêu cầu"
   },
   {
    "t": "p",
    "text": "– Gửi yêu cầu qua email cscavietnam@gmail.com hoặc Zalo 0705 537 538, nêu rõ nội dung yêu cầu."
   },
   {
    "t": "p",
    "text": "– Chúng tôi xác minh danh tính (thông qua email/số điện thoại đã đăng ký) trước khi xử lý."
   },
   {
    "t": "p",
    "text": "– Phản hồi trong vòng 03 ngày làm việc và hoàn tất xử lý trong thời hạn luật định."
   },
   {
    "t": "p",
    "text": "– Chúng tôi có thể từ chối yêu cầu khi không xác minh được danh tính, yêu cầu trái luật hoặc dữ liệu cần lưu theo nghĩa vụ pháp lý, và sẽ nêu rõ lý do."
   },
   {
    "t": "h",
    "text": "12. Trách nhiệm của khách hàng"
   },
   {
    "t": "p",
    "text": "– Cung cấp thông tin chính xác, cập nhật."
   },
   {
    "t": "p",
    "text": "– Giữ bí mật tài khoản, mật khẩu; thông báo ngay khi phát hiện sử dụng trái phép."
   },
   {
    "t": "p",
    "text": "– Không cung cấp dữ liệu cá nhân của người khác khi chưa được phép."
   },
   {
    "t": "p",
    "text": "– Người dưới 18 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ khi đăng ký và cung cấp thông tin."
   },
   {
    "t": "h",
    "text": "13. Cập nhật Chính sách bảo mật"
   },
   {
    "t": "p",
    "text": "Chúng tôi có thể sửa đổi chính sách này và đăng phiên bản mới trên website; phiên bản mới có hiệu lực kể từ thời điểm đăng tải, trừ khi pháp luật yêu cầu khác. Việc tiếp tục sử dụng dịch vụ sau thời điểm đó được hiểu là đã biết và đồng ý với nội dung cập nhật."
   }
  ]
 },
 {
  "num": "02",
  "slug": "giai-quyet-khieu-nai",
  "title": "Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "p",
    "text": "Văn bản này quy định cách người dùng gửi phản ánh, yêu cầu, khiếu nại và cách chúng tôi tiếp nhận, xử lý."
   },
   {
    "t": "h",
    "text": "1. Nguyên tắc"
   },
   {
    "t": "p",
    "text": "Chúng tôi tiếp nhận mọi phản ánh, yêu cầu, khiếu nại liên quan đến dịch vụ trên website một cách miễn phí, khách quan, kịp thời; ưu tiên thương lượng, hòa giải với người dùng; không gây khó khăn cho người dùng khi thực hiện quyền khiếu nại."
   },
   {
    "t": "h",
    "text": "2. Kênh tiếp nhận"
   },
   {
    "t": "p",
    "text": "– Điện thoại/Zalo: 0705 537 538"
   },
   {
    "t": "p",
    "text": "– Email: cscavietnam@gmail.com"
   },
   {
    "t": "p",
    "text": "– Trực tiếp: Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội"
   },
   {
    "t": "p",
    "text": "– Thời gian tiếp nhận: 8:00–17:30, từ thứ Hai đến thứ Bảy. Yêu cầu gửi ngoài giờ được ghi nhận và xử lý từ ngày làm việc kế tiếp."
   },
   {
    "t": "h",
    "text": "3. Phân loại phản ánh, yêu cầu"
   },
   {
    "t": "p",
    "text": "– Sự cố kỹ thuật (không đăng nhập được, lỗi bài thi, lỗi hiển thị)."
   },
   {
    "t": "p",
    "text": "– Thanh toán, kích hoạt gói, hóa đơn."
   },
   {
    "t": "p",
    "text": "– Hoàn tiền, hủy gói."
   },
   {
    "t": "p",
    "text": "– Nội dung câu hỏi, kết quả chấm điểm, đáp án."
   },
   {
    "t": "p",
    "text": "– Dữ liệu cá nhân và tài khoản."
   },
   {
    "t": "p",
    "text": "– Khiếu nại về thái độ phục vụ hoặc thông tin quảng cáo."
   },
   {
    "t": "h",
    "text": "4. Thông tin cần cung cấp"
   },
   {
    "t": "p",
    "text": "Họ tên; email/số điện thoại đăng ký tài khoản; mã giao dịch hoặc thời điểm giao dịch (nếu có); nội dung cụ thể; hình ảnh, chứng từ chuyển khoản hoặc ảnh chụp màn hình liên quan; mong muốn giải quyết."
   },
   {
    "t": "h",
    "text": "5. Quy trình giải quyết"
   },
   {
    "t": "p",
    "text": "– Bước 1 – Tiếp nhận: ghi nhận yêu cầu, cấp mã tiếp nhận và xác nhận đã nhận cho người dùng."
   },
   {
    "t": "p",
    "text": "– Bước 2 – Xác minh: đối chiếu dữ liệu hệ thống, giao dịch ngân hàng, nhật ký sử dụng."
   },
   {
    "t": "p",
    "text": "– Bước 3 – Đề xuất phương án: thông báo kết quả xác minh và phương án xử lý."
   },
   {
    "t": "p",
    "text": "– Bước 4 – Thực hiện: sửa lỗi, kích hoạt lại, hoàn tiền hoặc điều chỉnh theo phương án đã thống nhất."
   },
   {
    "t": "p",
    "text": "– Bước 5 – Đóng hồ sơ: xác nhận với người dùng và lưu hồ sơ vụ việc."
   },
   {
    "t": "h",
    "text": "6. Thời hạn xử lý"
   },
   {
    "t": "table",
    "rows": [
     [
      "Loại vụ việc",
      "Phản hồi ban đầu",
      "Dự kiến giải quyết"
     ],
     [
      "Sự cố kỹ thuật, kích hoạt gói",
      "Trong 01 ngày làm việc",
      "Trong 03 ngày làm việc"
     ],
     [
      "Thanh toán, hoàn tiền, hóa đơn",
      "Trong 01 ngày làm việc",
      "Trong 07 ngày làm việc"
     ],
     [
      "Dữ liệu cá nhân",
      "Trong 03 ngày làm việc",
      "Theo thời hạn pháp luật"
     ],
     [
      "Khiếu nại phức tạp",
      "Trong 01 ngày làm việc",
      "Tối đa 15 ngày làm việc, kèm thông báo lý do gia hạn"
     ]
    ]
   },
   {
    "t": "h",
    "text": "7. Hỗ trợ khi có sự cố"
   },
   {
    "t": "p",
    "text": "Khi người dùng bị trừ tiền nhưng chưa được kích hoạt dịch vụ, bị lỗi khi đang làm bài hoặc phát hiện tài khoản bị truy cập trái phép, vui lòng liên hệ ngay qua điện thoại/Zalo để được ưu tiên xử lý."
   },
   {
    "t": "h",
    "text": "8. Thương lượng, hòa giải"
   },
   {
    "t": "p",
    "text": "Các bên ưu tiên trao đổi, thương lượng. Nếu không đạt thỏa thuận, người dùng có quyền gửi yêu cầu đến tổ chức bảo vệ quyền lợi người tiêu dùng, cơ quan quản lý nhà nước có thẩm quyền hoặc khởi kiện tại Tòa án có thẩm quyền theo pháp luật Việt Nam."
   },
   {
    "t": "h",
    "text": "9. Xem xét lại"
   },
   {
    "t": "p",
    "text": "Nếu chưa đồng ý với kết quả, người dùng có thể đề nghị xem xét lại trong 15 ngày kể từ khi nhận kết quả; yêu cầu sẽ do người có thẩm quyền cao hơn trong công ty xem xét."
   },
   {
    "t": "h",
    "text": "10. Lưu trữ hồ sơ"
   },
   {
    "t": "p",
    "text": "Hồ sơ phản ánh, khiếu nại và kết quả xử lý được lưu để phục vụ đối soát và cung cấp cho cơ quan có thẩm quyền khi được yêu cầu."
   }
  ]
 },
 {
  "num": "03",
  "slug": "chinh-sach-gia",
  "title": "Chính sách giá",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "h",
    "text": "1. Nguyên tắc niêm yết giá"
   },
   {
    "t": "p",
    "text": "Giá các gói dịch vụ được công khai trên website trước khi người dùng đặt mua hoặc thanh toán, bằng đồng Việt Nam (VNĐ). Tổng số tiền phải thanh toán được hiển thị trước khi người dùng xác nhận."
   },
   {
    "t": "h",
    "text": "2. Bảng giá hiện hành"
   },
   {
    "t": "table",
    "rows": [
     [
      "Gói dịch vụ",
      "Giá (VNĐ)",
      "Thời hạn sử dụng"
     ],
     [
      "Mức 1 – Nền tảng",
      "Miễn phí",
      "Không giới hạn"
     ],
     [
      "Mức 2 – Cơ bản",
      "39.000",
      "30 ngày"
     ],
     [
      "Mức 3 – Gói theo môn",
      "290.000",
      "03 tháng"
     ],
     [
      "Mức 4 – Gói trọn bộ",
      "690.000",
      "03 tháng"
     ],
     [
      "Mức 5 – Gói đồng hành",
      "1.990.000",
      "12 tháng"
     ]
    ]
   },
   {
    "t": "p",
    "text": "Giá trên đã bao gồm thuế giá trị gia tăng (VAT)."
   },
   {
    "t": "h",
    "text": "3. Thành phần giá"
   },
   {
    "t": "p",
    "text": "Giá niêm yết đã bao gồm VAT và quyền sử dụng các tính năng của gói trong thời hạn tương ứng. Không phát sinh phí ẩn; giá hiển thị tại bước thanh toán là giá cuối cùng."
   },
   {
    "t": "h",
    "text": "4. Các khoản thường không bao gồm trong giá"
   },
   {
    "t": "p",
    "text": "Phí kết nối Internet, thiết bị của người dùng; phí giao dịch do ngân hàng, ví điện tử hoặc tổ chức phát hành thẻ thu (nếu có) và được thông báo trước khi thanh toán."
   },
   {
    "t": "h",
    "text": "5. Áp dụng giá theo thời điểm đặt mua"
   },
   {
    "t": "p",
    "text": "Giá áp dụng là giá hiển thị tại thời điểm người dùng hoàn tất thanh toán. Sau khi đơn hàng đã thanh toán, chúng tôi không tự ý thay đổi giá, trừ khi pháp luật cho phép hoặc có thỏa thuận với người dùng."
   },
   {
    "t": "h",
    "text": "6. Điều chỉnh giá và khuyến mại"
   },
   {
    "t": "p",
    "text": "Chúng tôi có quyền điều chỉnh giá, triển khai khuyến mại, mã giảm giá và sẽ công khai trên website. Mức giá mới chỉ áp dụng cho giao dịch phát sinh sau thời điểm cập nhật. Điều kiện, thời hạn, phạm vi áp dụng của từng chương trình khuyến mại được nêu rõ khi triển khai."
   },
   {
    "t": "h",
    "text": "7. Xử lý lỗi hiển thị giá"
   },
   {
    "t": "p",
    "text": "Nếu giá hiển thị sai do lỗi kỹ thuật hoặc nhập liệu: nếu phát hiện trước khi thanh toán, chúng tôi sẽ cập nhật giá đúng để người dùng lựa chọn; nếu phát hiện sau khi thanh toán, chúng tôi liên hệ người dùng để thống nhất phương án điều chỉnh, thay thế hoặc hoàn tiền. Chúng tôi không phải cung cấp dịch vụ theo mức giá sai rõ ràng do lỗi hệ thống khi giao dịch chưa được xác nhận."
   },
   {
    "t": "h",
    "text": "8. Công khai tổng tiền trước khi thanh toán"
   },
   {
    "t": "p",
    "text": "Trước khi xác nhận, hệ thống hiển thị tên gói, giá, mức giảm giá (nếu có), phương thức thanh toán và tổng số tiền để người dùng kiểm tra."
   },
   {
    "t": "h",
    "text": "9. Hóa đơn và chứng từ"
   },
   {
    "t": "p",
    "text": "Hóa đơn điện tử được xuất khi người dùng có yêu cầu, kèm thông tin xuất hóa đơn (tên, mã số thuế, địa chỉ, email), gửi yêu cầu trong vòng 07 ngày kể từ ngày thanh toán qua email cscavietnam@gmail.com. Chúng tôi gửi hóa đơn qua email trong thời hạn theo quy định."
   }
  ]
 },
 {
  "num": "04",
  "slug": "chinh-sach-thanh-toan",
  "title": "Chính sách thanh toán",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "h",
    "text": "1. Đồng tiền thanh toán"
   },
   {
    "t": "p",
    "text": "Giao dịch được thực hiện bằng đồng Việt Nam (VNĐ). Website không niêm yết giá bằng ngoại tệ."
   },
   {
    "t": "h",
    "text": "2. Phương thức thanh toán được chấp nhận"
   },
   {
    "t": "p",
    "text": "– Chuyển khoản ngân hàng (quét mã QR hoặc chuyển thủ công): chủ tài khoản CÔNG TY TNHH NOVAPATH GLOBAL; số tài khoản 535 368 368; ngân hàng MBBANK – Chi nhánh Gia Lâm. Nội dung chuyển khoản ghi đúng mã đơn hàng hoặc email tài khoản như hiển thị tại bước thanh toán."
   },
   {
    "t": "p",
    "text": "Chúng tôi chỉ chấp nhận các phương thức được công bố tại mục này."
   },
   {
    "t": "h",
    "text": "3. Quy trình thanh toán"
   },
   {
    "t": "p",
    "text": "– Bước 1: Người dùng đăng nhập, chọn gói dịch vụ."
   },
   {
    "t": "p",
    "text": "– Bước 2: Hệ thống hiển thị giá và tổng tiền."
   },
   {
    "t": "p",
    "text": "– Bước 3: Người dùng chuyển khoản theo thông tin hiển thị."
   },
   {
    "t": "p",
    "text": "– Bước 4: Chúng tôi đối soát giao dịch và kích hoạt gói; gửi xác nhận qua email/thông báo trên tài khoản."
   },
   {
    "t": "p",
    "text": "– Bước 5: Nếu chưa nhận được kích hoạt, người dùng liên hệ hỗ trợ kèm chứng từ."
   },
   {
    "t": "h",
    "text": "4. Mã giảm giá, voucher"
   },
   {
    "t": "p",
    "text": "Điều kiện (giá trị, gói áp dụng, thời hạn, số lần dùng, điều kiện cộng dồn) được công bố cùng chương trình. Mã hết hạn hoặc không đáp ứng điều kiện sẽ không được áp dụng; phần chênh lệch (nếu có) do người dùng thanh toán."
   },
   {
    "t": "h",
    "text": "5. Xác nhận thanh toán"
   },
   {
    "t": "p",
    "text": "Giao dịch được coi là thành công khi tiền đã ghi có vào tài khoản của chúng tôi và nội dung chuyển khoản khớp với đơn hàng. Gói dịch vụ được kích hoạt tự động hoặc thủ công trong vòng 24 giờ kể từ khi xác nhận thành công (trong giờ làm việc nếu cần xác nhận thủ công)."
   },
   {
    "t": "h",
    "text": "6. Giao dịch thất bại, treo hoặc trùng"
   },
   {
    "t": "p",
    "text": "– Giao dịch thất bại: người dùng thử lại hoặc chọn phương thức khác."
   },
   {
    "t": "p",
    "text": "– Đã bị trừ tiền nhưng chưa được kích hoạt: gửi mã giao dịch/ảnh chứng từ; chúng tôi xử lý trong 03 ngày làm việc."
   },
   {
    "t": "p",
    "text": "– Thanh toán trùng: được hoàn lại khoản thanh toán thừa sau khi đối soát."
   },
   {
    "t": "h",
    "text": "7. Kiểm soát rủi ro"
   },
   {
    "t": "p",
    "text": "Chúng tôi có thể tạm dừng xác nhận, yêu cầu người dùng bổ sung thông tin xác minh khi giao dịch có dấu hiệu bất thường hoặc gian lận, hoặc khi ngân hàng yêu cầu; việc này luôn có căn cứ xác minh và được thông báo cho người dùng. Người dùng chịu trách nhiệm về tính hợp pháp của nguồn tiền/phương thức thanh toán mình sử dụng."
   },
   {
    "t": "h",
    "text": "8. Hoàn tiền thanh toán"
   },
   {
    "t": "p",
    "text": "Việc hoàn tiền thực hiện theo Chính sách chấm dứt dịch vụ và hoàn tiền; ưu tiên hoàn về tài khoản đã thanh toán. Thời gian chúng tôi xử lý được nêu trong chính sách đó; thời gian tiền về tài khoản còn phụ thuộc ngân hàng."
   },
   {
    "t": "h",
    "text": "9. Hóa đơn, chứng từ và đối soát"
   },
   {
    "t": "p",
    "text": "Người dùng yêu cầu hóa đơn theo Chính sách giá. Chúng tôi lưu dữ liệu thanh toán, mã giao dịch và chứng từ hoàn tiền để đối soát và phục vụ giải quyết khiếu nại."
   }
  ]
 },
 {
  "num": "05",
  "slug": "dieu-khoan-su-dung",
  "title": "Điều kiện hoặc hạn chế trong việc cung cấp dịch vụ",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "p",
    "text": "Văn bản này nêu các điều kiện, giới hạn khi người dùng sử dụng dịch vụ luyện thi CSCA trực tuyến."
   },
   {
    "t": "h",
    "text": "1. Phạm vi áp dụng"
   },
   {
    "t": "p",
    "text": "Áp dụng cho toàn bộ gói dịch vụ trên luyenthicsca.edu.vn gồm thi thử, phân tích kết quả, lộ trình học và gia sư AI cho các môn Toán, Vật lý, Hóa học, Tiếng Trung chuyên ngành. Dịch vụ không thuộc ngành nghề kinh doanh có điều kiện."
   },
   {
    "t": "h",
    "text": "2. Tính khả dụng của dịch vụ"
   },
   {
    "t": "p",
    "text": "Việc hiển thị gói trên website chưa đồng nghĩa đơn hàng được xác nhận; dịch vụ chỉ được cung cấp sau khi thanh toán thành công. Trường hợp gói tạm ngừng cung cấp, chúng tôi sẽ thông báo và hoàn tiền nếu người dùng đã thanh toán."
   },
   {
    "t": "h",
    "text": "3. Điều kiện về đối tượng người dùng"
   },
   {
    "t": "p",
    "text": "– Cá nhân đăng ký tài khoản bằng thông tin chính xác."
   },
   {
    "t": "p",
    "text": "– Người dưới 18 tuổi cần có sự đồng ý của cha mẹ hoặc người giám hộ."
   },
   {
    "t": "p",
    "text": "– Một tài khoản dành cho một người dùng; không chia sẻ, cho thuê, bán lại tài khoản."
   },
   {
    "t": "h",
    "text": "4. Điều kiện kỹ thuật"
   },
   {
    "t": "p",
    "text": "Người dùng cần thiết bị có kết nối Internet và trình duyệt phiên bản hiện đại. Chất lượng trải nghiệm phụ thuộc đường truyền và thiết bị của người dùng."
   },
   {
    "t": "h",
    "text": "5. Giới hạn về thời gian sử dụng"
   },
   {
    "t": "p",
    "text": "Mỗi gói có thời hạn sử dụng nêu tại Chính sách giá (ví dụ 03 tháng). Hết thời hạn, quyền truy cập các tính năng của gói chấm dứt; dữ liệu học tập được lưu theo Chính sách bảo mật. Không bảo lưu thời hạn nếu không có lỗi từ phía chúng tôi."
   },
   {
    "t": "h",
    "text": "6. Giới hạn về phạm vi địa lý"
   },
   {
    "t": "p",
    "text": "Dịch vụ cung cấp trực tuyến, có thể truy cập từ mọi địa điểm có Internet; không có giao nhận hàng hóa vật lý."
   },
   {
    "t": "h",
    "text": "7. Giới hạn về nội dung và kết quả"
   },
   {
    "t": "p",
    "text": "– Điểm sẵn sàng (Readiness Score) và phân tích AI chỉ là ước tính hỗ trợ ôn luyện, không phải điểm thi CSCA chính thức."
   },
   {
    "t": "p",
    "text": "– Dịch vụ không cam kết kết quả thi, kết quả xét tuyển hoặc học bổng."
   },
   {
    "t": "p",
    "text": "– Nội dung do AI tạo ra có thể chưa hoàn toàn chính xác; người dùng nên đối chiếu với tài liệu chính thức."
   },
   {
    "t": "h",
    "text": "8. Quyền sở hữu trí tuệ"
   },
   {
    "t": "p",
    "text": "Ngân hàng câu hỏi, đề thi thử, tài liệu và giao diện thuộc quyền của NovaPath Global. Không sao chép, phân phối, khai thác thương mại hoặc chia sẻ nội dung khi chưa được cho phép bằng văn bản."
   },
   {
    "t": "h",
    "text": "9. Hạn chế do bất khả kháng"
   },
   {
    "t": "p",
    "text": "Dịch vụ có thể bị gián đoạn do thiên tai, dịch bệnh, sự cố hạ tầng Internet, quyết định của cơ quan nhà nước hoặc sự kiện ngoài khả năng kiểm soát. Chúng tôi sẽ thông báo và có biện pháp khắc phục hoặc gia hạn/hoàn tiền phù hợp; điều khoản này không loại trừ trách nhiệm do lỗi của chúng tôi."
   },
   {
    "t": "h",
    "text": "10. Hạn chế trong vận hành website"
   },
   {
    "t": "p",
    "text": "Website có thể được bảo trì định kỳ hoặc đột xuất; chúng tôi thông báo trên website khi có thể. Sự cố kỹ thuật được xử lý theo Phương thức tiếp nhận và giải quyết phản ánh, khiếu nại."
   },
   {
    "t": "h",
    "text": "11. Điều kiện từ chối hoặc chấm dứt cung cấp dịch vụ"
   },
   {
    "t": "p",
    "text": "Chúng tôi có thể từ chối hoặc chấm dứt cung cấp dịch vụ khi: thông tin đăng ký giả mạo; chia sẻ/bán lại tài khoản; gian lận thanh toán; sao chép, khai thác trái phép nội dung; tác động trái phép vào hệ thống; vi phạm pháp luật. Việc này được thông báo cho người dùng và việc hoàn tiền (nếu có) xem xét theo Chính sách chấm dứt dịch vụ và hoàn tiền."
   }
  ]
 },
 {
  "num": "06",
  "slug": "chinh-sach-hoan-tien",
  "title": "Chính sách chấm dứt dịch vụ và hoàn tiền",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "p",
    "text": "Quyền lợi của người tiêu dùng theo quy định pháp luật không bị hạn chế bởi chính sách này."
   },
   {
    "t": "h",
    "text": "1. Phạm vi áp dụng"
   },
   {
    "t": "p",
    "text": "Áp dụng cho các gói dịch vụ trả phí (Mức 2 – Cơ bản, Mức 3 – Gói theo môn, Mức 4 – Gói trọn bộ, Mức 5 – Gói đồng hành) trên luyenthicsca.edu.vn."
   },
   {
    "t": "h",
    "text": "2. Các trường hợp chấm dứt dịch vụ"
   },
   {
    "t": "p",
    "text": "– Hết thời hạn sử dụng của gói."
   },
   {
    "t": "p",
    "text": "– Người dùng yêu cầu ngừng sử dụng hoặc xóa tài khoản."
   },
   {
    "t": "p",
    "text": "– Chúng tôi chấm dứt do vi phạm điều kiện sử dụng, gian lận."
   },
   {
    "t": "p",
    "text": "– Chúng tôi ngừng cung cấp gói hoặc dịch vụ."
   },
   {
    "t": "p",
    "text": "– Sự kiện bất khả kháng."
   },
   {
    "t": "h",
    "text": "3. Hủy dịch vụ do người dùng"
   },
   {
    "t": "p",
    "text": "Người dùng gửi yêu cầu qua email cscavietnam@gmail.com hoặc Zalo 0705 537 538, nêu họ tên, email tài khoản, gói đã mua, mã giao dịch và lý do. Mức hoàn tiền phụ thuộc mức độ đã sử dụng như mục 7 và 9."
   },
   {
    "t": "h",
    "text": "4. Hủy do chúng tôi hoặc nguyên nhân vận hành"
   },
   {
    "t": "p",
    "text": "Khi chúng tôi không thể cung cấp dịch vụ như đã công bố (lỗi hệ thống không khắc phục được, ngừng cung cấp gói), người dùng được lựa chọn gia hạn tương ứng thời gian gián đoạn, chuyển sang gói tương đương hoặc hoàn tiền theo phần chưa sử dụng."
   },
   {
    "t": "h",
    "text": "5. Hủy do bất khả kháng"
   },
   {
    "t": "p",
    "text": "Chúng tôi hỗ trợ gia hạn thời gian sử dụng tương ứng hoặc xem xét hoàn tiền phần chưa sử dụng, tùy từng trường hợp cụ thể."
   },
   {
    "t": "h",
    "text": "6. Điều kiện xem xét hoàn tiền"
   },
   {
    "t": "p",
    "text": "Yêu cầu gửi trong vòng 07 ngày kể từ ngày thanh toán thành công, kèm mã giao dịch/chứng từ."
   },
   {
    "t": "h",
    "text": "7. Hoàn tiền toàn phần và một phần"
   },
   {
    "t": "p",
    "text": "– Hoàn 100% khi: thanh toán trùng; giao dịch lỗi; dịch vụ không được kích hoạt do lỗi hệ thống mà không khắc phục được trong 03 ngày làm việc; hoặc người dùng yêu cầu trong 07 ngày và chưa sử dụng dịch vụ (chưa làm bài thi, chưa dùng tính năng của gói)."
   },
   {
    "t": "p",
    "text": "– Hoàn một phần khi: gói đã được sử dụng một phần nhưng dịch vụ không còn khả năng cung cấp do lỗi của chúng tôi; số tiền hoàn tính theo thời gian/phần chưa sử dụng."
   },
   {
    "t": "h",
    "text": "8. Các khoản có thể bị khấu trừ"
   },
   {
    "t": "p",
    "text": "Phí giao dịch của ngân hàng/tổ chức thanh toán (nếu phát sinh và đã thông báo), giá trị khuyến mại đã áp dụng cho phần đã sử dụng."
   },
   {
    "t": "h",
    "text": "9. Các trường hợp có thể không được hoàn tiền"
   },
   {
    "t": "p",
    "text": "– Gói đã được sử dụng đáng kể, hoặc quá thời hạn yêu cầu hoàn tiền."
   },
   {
    "t": "p",
    "text": "– Tài khoản bị chấm dứt do vi phạm điều kiện sử dụng, gian lận."
   },
   {
    "t": "p",
    "text": "– Người dùng thay đổi ý định sau khi đã sử dụng dịch vụ mà không có lỗi từ phía chúng tôi."
   },
   {
    "t": "p",
    "text": "– Không đạt kết quả thi hoặc xét tuyển như kỳ vọng (dịch vụ không cam kết kết quả)."
   },
   {
    "t": "h",
    "text": "10. Phương thức hoàn tiền"
   },
   {
    "t": "p",
    "text": "Hoàn về tài khoản ngân hàng đã dùng để thanh toán hoặc tài khoản do người dùng cung cấp có cùng chủ thể; có thể hoàn bằng gia hạn thời gian sử dụng nếu người dùng đồng ý."
   },
   {
    "t": "h",
    "text": "11. Thời gian hoàn tiền"
   },
   {
    "t": "p",
    "text": "Chúng tôi xử lý và chuyển tiền trong 07 ngày làm việc kể từ khi chấp thuận yêu cầu. Thời gian tiền về tài khoản còn phụ thuộc ngân hàng."
   },
   {
    "t": "h",
    "text": "12. Quy trình yêu cầu hủy hoặc hoàn tiền"
   },
   {
    "t": "p",
    "text": "– Bước 1: gửi yêu cầu kèm thông tin, chứng từ."
   },
   {
    "t": "p",
    "text": "– Bước 2: chúng tôi xác nhận đã nhận trong 01 ngày làm việc."
   },
   {
    "t": "p",
    "text": "– Bước 3: kiểm tra dữ liệu thanh toán và mức độ sử dụng."
   },
   {
    "t": "p",
    "text": "– Bước 4: thông báo kết quả và số tiền hoàn."
   },
   {
    "t": "p",
    "text": "– Bước 5: chuyển tiền, ghi nhận và lưu hồ sơ."
   },
   {
    "t": "h",
    "text": "13. Chấm dứt tài khoản hoặc quyền sử dụng"
   },
   {
    "t": "p",
    "text": "Khi tài khoản bị tạm khóa hoặc chấm dứt, chúng tôi thông báo lý do cho người dùng; người dùng có quyền phản hồi trong 07 ngày. Dữ liệu được xử lý theo Chính sách bảo mật."
   },
   {
    "t": "h",
    "text": "14. Chargeback và tranh chấp thanh toán"
   },
   {
    "t": "p",
    "text": "Khi phát sinh tranh chấp với ngân hàng, người dùng nên liên hệ chúng tôi trước để được giải quyết. Chúng tôi cung cấp chứng từ giao dịch, nhật ký kích hoạt và sử dụng dịch vụ cho ngân hàng/tổ chức thanh toán khi cần."
   }
  ]
 },
 {
  "num": "07",
  "slug": "chinh-sach-cung-cap-dich-vu",
  "title": "Chính sách về phương thức cung cấp dịch vụ",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "h",
    "text": "1. Phạm vi dịch vụ cung cấp qua website"
   },
   {
    "t": "p",
    "text": "Dịch vụ số luyện thi CSCA trực tuyến: thi thử nhiều mức độ; chấm điểm và phân tích bằng AI; lộ trình học cá nhân hóa; gia sư AI; các môn Toán, Vật lý, Hóa học, Tiếng Trung chuyên ngành."
   },
   {
    "t": "h",
    "text": "2. Quy trình cung cấp dịch vụ trực tuyến"
   },
   {
    "t": "p",
    "text": "– Người dùng đăng ký tài khoản và đăng nhập."
   },
   {
    "t": "p",
    "text": "– Chọn gói, thanh toán theo Chính sách thanh toán."
   },
   {
    "t": "p",
    "text": "– Hệ thống kích hoạt gói trên tài khoản."
   },
   {
    "t": "p",
    "text": "– Người dùng truy cập và sử dụng dịch vụ trực tiếp trên website."
   },
   {
    "t": "h",
    "text": "3. Hình thức xác nhận dịch vụ"
   },
   {
    "t": "p",
    "text": "Xác nhận qua thông báo trên tài khoản và/hoặc email đăng ký, nêu gói đã mua, thời điểm kích hoạt và thời hạn sử dụng."
   },
   {
    "t": "h",
    "text": "4. Thời điểm dịch vụ được coi là đã xác nhận"
   },
   {
    "t": "p",
    "text": "– Xác nhận tự động: ngay khi hệ thống ghi nhận thanh toán thành công."
   },
   {
    "t": "p",
    "text": "– Chờ xác nhận thủ công: trường hợp cần đối soát, chúng tôi xác nhận trong vòng 24 giờ (trong giờ làm việc)."
   },
   {
    "t": "h",
    "text": "5. Cách người dùng sử dụng dịch vụ"
   },
   {
    "t": "p",
    "text": "Sử dụng trực tiếp trên website bằng tài khoản đã kích hoạt, trên máy tính hoặc thiết bị di động có Internet. Không cần giao nhận hàng hóa vật lý."
   },
   {
    "t": "h",
    "text": "6. Cung cấp dịch vụ thông qua đối tác"
   },
   {
    "t": "p",
    "text": "Hạ tầng công nghệ, thanh toán có thể do đối tác cung cấp. NovaPath Global là bên chịu trách nhiệm trực tiếp trước người dùng về dịch vụ."
   },
   {
    "t": "h",
    "text": "7. Thay đổi thông tin sau khi đã xác nhận"
   },
   {
    "t": "p",
    "text": "Người dùng có thể cập nhật thông tin hồ sơ trong tài khoản; việc đổi gói, đổi email tài khoản hoặc chuyển nhượng gói do chúng tôi xem xét theo yêu cầu gửi tới cscavietnam@gmail.com."
   },
   {
    "t": "h",
    "text": "8. Không sử dụng dịch vụ"
   },
   {
    "t": "p",
    "text": "Việc người dùng không đăng nhập hoặc không sử dụng trong thời hạn gói không làm phát sinh quyền gia hạn hoặc hoàn tiền, trừ trường hợp theo Chính sách chấm dứt dịch vụ và hoàn tiền."
   },
   {
    "t": "h",
    "text": "9. Hỗ trợ trong quá trình sử dụng"
   },
   {
    "t": "p",
    "text": "Hỗ trợ qua điện thoại/Zalo 0705 537 538 và email cscavietnam@gmail.com, 8:00–17:30, từ thứ Hai đến thứ Bảy."
   },
   {
    "t": "h",
    "text": "10. Bất khả kháng và gián đoạn dịch vụ"
   },
   {
    "t": "p",
    "text": "Trường hợp bất khả kháng hoặc bảo trì, chúng tôi thông báo và khôi phục sớm nhất; có thể gia hạn thời gian sử dụng tương ứng nếu gián đoạn kéo dài do lỗi của chúng tôi."
   },
   {
    "t": "h",
    "text": "11. Kiểm tra thông tin sau khi nhận xác nhận"
   },
   {
    "t": "p",
    "text": "Người dùng cần kiểm tra gói, thời hạn và thông tin tài khoản ngay sau khi nhận xác nhận và báo ngay khi có sai sót để được điều chỉnh."
   }
  ]
 },
 {
  "num": "08",
  "slug": "ho-tro-truc-tuyen",
  "title": "Thông tin hình thức hỗ trợ trực tuyến",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "h",
    "text": "Các kênh hỗ trợ"
   },
   {
    "t": "table",
    "rows": [
     [
      "Kênh",
      "Thông tin"
     ],
     [
      "Điện thoại",
      "0705 537 538"
     ],
     [
      "Zalo",
      "0705 537 538"
     ],
     [
      "Email",
      "cscavietnam@gmail.com"
     ],
     [
      "Thời gian hỗ trợ",
      "8:00–17:30, từ thứ Hai đến thứ Bảy"
     ]
    ]
   },
   {
    "t": "p",
    "text": "Người dùng liên hệ các kênh trên để được hỗ trợ về tài khoản, thanh toán, kích hoạt gói, sự cố kỹ thuật, hoàn tiền và khiếu nại."
   }
  ]
 },
 {
  "num": "09",
  "slug": "quyen-va-nghia-vu",
  "title": "Quyền và nghĩa vụ của các bên",
  "blocks": [
   {
    "t": "p",
    "text": "Công ty TNHH NovaPath Global (sau đây gọi là “NovaPath Global” hoặc “Chúng tôi”), mã số doanh nghiệp 0111590890, địa chỉ Số 7/167 Phố Ngô Xuân Quảng, Xã Gia Lâm, Hà Nội, là chủ sở hữu và đơn vị vận hành nền tảng CSCA VIỆT NAM (luyenthicsca.edu.vn)."
   },
   {
    "t": "p",
    "text": "Văn bản này công khai điều kiện giao dịch, giúp người dùng hiểu quyền lợi và trách nhiệm của mỗi bên, hạn chế tranh chấp."
   },
   {
    "t": "h",
    "text": "1. Vai trò của chủ sở hữu website"
   },
   {
    "t": "p",
    "text": "NovaPath Global vận hành website luyenthicsca.edu.vn, trực tiếp cung cấp dịch vụ luyện thi CSCA trực tuyến và là đầu mối tiếp nhận giao dịch, hỗ trợ và khiếu nại."
   },
   {
    "t": "h",
    "text": "2. Quyền của chủ sở hữu website"
   },
   {
    "t": "p",
    "text": "– Ban hành, sửa đổi điều kiện giao dịch và công bố trên website."
   },
   {
    "t": "p",
    "text": "– Từ chối hoặc chấm dứt giao dịch có dấu hiệu gian lận, vi phạm điều kiện sử dụng."
   },
   {
    "t": "p",
    "text": "– Yêu cầu người dùng cung cấp thông tin để xác minh."
   },
   {
    "t": "p",
    "text": "– Bảo vệ quyền sở hữu trí tuệ đối với nội dung, ngân hàng câu hỏi, phần mềm."
   },
   {
    "t": "p",
    "text": "– Lưu trữ dữ liệu giao dịch phục vụ giải quyết tranh chấp và nghĩa vụ pháp lý."
   },
   {
    "t": "h",
    "text": "3. Nghĩa vụ của chủ sở hữu website"
   },
   {
    "t": "p",
    "text": "– Công khai thông tin doanh nghiệp, giá, điều kiện giao dịch."
   },
   {
    "t": "p",
    "text": "– Cung cấp thông tin trung thực, dịch vụ đúng như đã công bố; xác nhận đơn hàng."
   },
   {
    "t": "p",
    "text": "– Bảo vệ thông tin cá nhân của người dùng."
   },
   {
    "t": "p",
    "text": "– Tiếp nhận, giải quyết khiếu nại; lưu trữ dữ liệu giao dịch."
   },
   {
    "t": "p",
    "text": "– Không kinh doanh hàng hóa, dịch vụ bị cấm."
   },
   {
    "t": "h",
    "text": "4. Quyền của khách hàng"
   },
   {
    "t": "p",
    "text": "– Được cung cấp đầy đủ thông tin trước khi giao dịch và tự do lựa chọn gói."
   },
   {
    "t": "p",
    "text": "– Được xác nhận đơn hàng, yêu cầu giải thích về giá."
   },
   {
    "t": "p",
    "text": "– Được bảo vệ dữ liệu cá nhân; khiếu nại; hoàn tiền theo chính sách và pháp luật."
   },
   {
    "t": "h",
    "text": "5. Nghĩa vụ của khách hàng"
   },
   {
    "t": "p",
    "text": "– Cung cấp thông tin chính xác; thanh toán đầy đủ."
   },
   {
    "t": "p",
    "text": "– Kiểm tra đơn hàng, tuân thủ điều kiện sử dụng; bảo mật tài khoản."
   },
   {
    "t": "p",
    "text": "– Không sao chép, chia sẻ, bán lại tài khoản và nội dung."
   },
   {
    "t": "p",
    "text": "– Phối hợp trong giải quyết khiếu nại."
   },
   {
    "t": "h",
    "text": "6. Đối tác cung cấp hạ tầng/thanh toán"
   },
   {
    "t": "p",
    "text": "Người dùng giao dịch trực tiếp với NovaPath Global. Đối tác công nghệ, thanh toán chỉ hỗ trợ vận hành và chịu ràng buộc theo hợp đồng với chúng tôi."
   },
   {
    "t": "h",
    "text": "7. Giới hạn trách nhiệm"
   },
   {
    "t": "p",
    "text": "Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm đối với thiệt hại do: bất khả kháng, thiên tai, dịch bệnh, quyết định của cơ quan nhà nước; lỗi của người dùng (lộ mật khẩu, thiết bị, đường truyền); giao dịch thực hiện ngoài website và kênh chính thức của chúng tôi. Giới hạn này không loại trừ quyền chính đáng của người tiêu dùng hoặc trách nhiệm do chính chúng tôi gây ra."
   }
  ]
 }
];

export const policyBySlug = (slug: string) => POLICIES.find((p) => p.slug === slug);
