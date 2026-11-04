#!/usr/bin/env python3
"""Sinh content/seo/posts-extra.json: các bài blog viết thêm (không đến từ docx).
Chạy: python3 scripts/seo_new_posts.py   → ghi content/seo/posts-extra.json
Nhập vào DB: node --env-file=.env.local scripts/import-seo-posts.mjs (đọc cả posts.json và posts-extra.json; mặc định ở trạng thái nháp)."""
import json, re, pathlib

SITE = "https://luyenthicsca.edu.vn"
posts = []

def add(no, planned, slug, title, seo_title, meta, keyword, keywords, category, body):
    body = body.strip() + "\n"
    words = len(re.sub(r"[#|*\-\[\]()>`]", " ", body).split())
    posts.append(dict(slug=slug, title=title, seo_title=seo_title, meta_description=meta, keyword=keyword, keywords=keywords, category=category,
                      body_md=body, planned_no=no, planned_for=planned, replaces_path=None, source_file="posts-extra (viết trực tiếp)", read_minutes=max(2, round(words / 200))))

# ---------------------------------------------------------------- 17
add(17, "2026-12-10", "mau-de-hoa-hoc-csca",
    "Mẫu đề Hóa học CSCA: 6 câu mẫu có đáp án và lời giải",
    "Mẫu đề Hóa học CSCA có đáp án: 6 câu từ pha loãng, pH đến chuẩn độ",
    "6 câu Hóa học mô phỏng theo đề cương CSCA kèm đáp án, lời giải và lỗi sai thường gặp: pha loãng, pH, thể tích khí, chuẩn độ, số oxi hóa, cấu hình electron.",
    "mẫu đề hóa học CSCA", ["đề thi hóa học CSCA", "bài tập hóa CSCA có lời giải", "ôn thi CSCA hóa học", "đề cương hóa học CSCA"], "Hóa học",
    f"""
Đề Hóa học CSCA chính thức gồm **48 câu trắc nghiệm một đáp án, làm trong 60 phút**, tức khoảng 75 giây mỗi câu. Dưới đây là 6 câu mẫu **mô phỏng theo đề cương**, trải đủ các mô-đun: tính toán, tính chất và phản ứng, lý thuyết, thí nghiệm. Đây là câu tự biên soạn để luyện tập, **không phải đề thi chính thức**.

**Cách dùng:** tự làm cả 6 câu trong 8 phút, rồi mới đọc lời giải. Câu nào sai, ghi lại dạng bài, đó là chỗ cần ôn.

## Câu 1 – Pha loãng dung dịch (Dễ)

Cần thêm bao nhiêu mL nước vào 100 mL dung dịch NaOH 0,5 M để thu được dung dịch 0,1 M?

A. 100 mL  B. 400 mL  C. 500 mL  D. 20 mL

**Đáp án: B.** Dùng $C_1V_1=C_2V_2$: $V_2=\\dfrac{{0{{,}}5\\cdot100}}{{0{{,}}1}}=500$ mL. Thể tích nước thêm là $500-100=400$ mL.
*Lỗi hay gặp:* chọn C (500 mL) vì nhầm thể tích sau pha loãng với thể tích nước cần thêm.

## Câu 2 – Tính pH (Dễ)

Dung dịch HCl có nồng độ 0,01 M. Giá trị pH của dung dịch là

A. 1  B. 2  C. 12  D. 0,01

**Đáp án: B.** HCl là axit mạnh, điện li hoàn toàn nên $[H^+]=0{{,}}01=10^{{-2}}$ M, suy ra $pH=-\\lg[H^+]=2$.
*Lỗi hay gặp:* chọn C (12) là pH của dung dịch bazơ cùng nồng độ; chọn D vì nhầm nồng độ với pH.

## Câu 3 – Thể tích khí ở điều kiện chuẩn (Trung bình)

Cho 6,5 g kẽm tác dụng hết với dung dịch HCl dư. Thể tích khí $H_2$ thu được ở điều kiện tiêu chuẩn là (Zn = 65)

A. 1,12 lít  B. 2,24 lít  C. 4,48 lít  D. 22,4 lít

**Đáp án: B.** $Zn+2HCl\\to ZnCl_2+H_2$. $n_{{Zn}}=\\dfrac{{6{{,}}5}}{{65}}=0{{,}}1$ mol nên $n_{{H_2}}=0{{,}}1$ mol, $V=0{{,}}1\\cdot22{{,}}4=2{{,}}24$ lít.
*Lỗi hay gặp:* chọn D (22,4 lít) vì quên nhân với số mol.

## Câu 4 – Chuẩn độ axit–bazơ (Trung bình)

Chuẩn độ 20 mL dung dịch HCl 0,1 M bằng dung dịch NaOH chưa biết nồng độ. Điểm tương đương khi dùng hết 25 mL NaOH. Nồng độ dung dịch NaOH là

A. 0,125 M  B. 0,08 M  C. 0,2 M  D. 0,05 M

**Đáp án: B.** Tại điểm tương đương $n_{{HCl}}=n_{{NaOH}}$: $0{{,}}1\\cdot20=C\\cdot25$, suy ra $C=0{{,}}08$ M.
*Lỗi hay gặp:* chọn A (0,125 M) vì lấy ngược tỉ lệ thể tích.

## Câu 5 – Số oxi hóa (Dễ)

Số oxi hóa của mangan trong $KMnO_4$ là

A. +2  B. +4  C. +6  D. +7

**Đáp án: D.** Tổng số oxi hóa bằng 0: $(+1)+x+4\\cdot(-2)=0$, suy ra $x=+7$.

## Câu 6 – Cấu hình electron (Trung bình)

Nguyên tử clo ($Z=17$) có số electron ở lớp ngoài cùng là

A. 5  B. 6  C. 7  D. 8

**Đáp án: C.** Cấu hình: $1s^2 2s^2 2p^6 3s^2 3p^5$. Lớp ngoài cùng (lớp 3) có $2+5=7$ electron, nên clo thuộc nhóm VIIA.

## Đọc kết quả của bạn

- **6/6:** nền tảng tốt, chuyển sang luyện theo thời gian thật.
- **4–5/6:** ổn, ôn lại đúng dạng bài sai.
- **dưới 4/6:** quay lại [đề cương Hóa học CSCA](/blog/de-cuong-hoa-hoc-csca) và học thuật ngữ song ngữ trong [bài từ vựng Lý – Hóa](/blog/thuat-ngu-ly-hoa-csca-song-ngu).

Đề thật còn có bản tiếng Trung hoặc tiếng Anh, nên ngoài kiến thức bạn cần quen với thuật ngữ. Làm thử ngay [đề Hóa học đúng cấu trúc 48 câu/60 phút](/thi-thu) hoặc bắt đầu với [bài kiểm tra nhanh miễn phí](/quick-test) để biết mô-đun nào đang yếu.
""")

# ---------------------------------------------------------------- 18
add(18, "2026-12-13", "cau-truc-de-thi-csca",
    "Cấu trúc đề thi CSCA: số câu, thời gian, môn bắt buộc và môn chọn",
    "Cấu trúc đề thi CSCA: 48 câu/60 phút, Tiếng Trung 80 câu/90 phút",
    "Tổng hợp cấu trúc đề CSCA: số câu và thời gian từng môn, môn nào bắt buộc, môn nào chọn theo ngành, đề tiếng Trung hay tiếng Anh, cách phân bổ thời gian.",
    "cấu trúc đề thi CSCA", ["đề thi CSCA gồm mấy môn", "thời gian thi CSCA", "số câu hỏi CSCA", "CSCA trắc nghiệm"], "Thông tin kỳ thi",
    """
CSCA (China Scholastic Competency Assessment) gồm các bài thi riêng cho từng môn. Toàn bộ câu hỏi là **trắc nghiệm một đáp án**. Bảng dưới đây tóm tắt cấu trúc.

## Bảng cấu trúc đề thi

| **Môn** | **Số câu** | **Thời gian** | **Ngôn ngữ đề** | **Khi nào phải thi** |
|---|---|---|---|---|
| Toán | 48 | 60 phút | Tiếng Trung hoặc tiếng Anh | Bắt buộc với mọi ngành |
| Vật lý | 48 | 60 phút | Tiếng Trung hoặc tiếng Anh | Theo yêu cầu ngành (kỹ thuật, một số ngành khoa học) |
| Hóa học | 48 | 60 phút | Tiếng Trung hoặc tiếng Anh | Theo yêu cầu ngành (hóa, y, dược, một số ngành khoa học) |
| Tiếng Trung chuyên ngành | 80 | 90 phút | Tiếng Trung | Thường dành cho chương trình dạy bằng tiếng Trung; chia khối Văn và khối Khoa học |

Thông tin này tổng hợp từ thông báo của các trường và cổng đăng ký. **Trường và ngành mục tiêu của bạn mới là nơi quyết định môn bắt buộc**, vì vậy hãy đọc thông báo tuyển sinh năm bạn nộp hồ sơ.

## Mỗi câu có bao nhiêu thời gian?

- Toán, Lý, Hóa: 60 phút ÷ 48 câu ≈ **75 giây mỗi câu**.
- Tiếng Trung chuyên ngành: 90 phút ÷ 80 câu ≈ **67 giây mỗi câu**, trong đó câu đọc hiểu tốn nhiều thời gian hơn.

Vì thời gian rất chặt, luyện tốc độ quan trọng ngang luyện kiến thức. Xem chiến thuật chi tiết trong bài [75 giây mỗi câu: quản lý thời gian làm bài CSCA](/blog/chien-thuat-lam-bai-csca).

## Nội dung ra đề theo môn

- **Toán:** hàm số và dãy số, tập hợp và bất phương trình, hình học và đại số, xác suất và thống kê. Xem [đề cương Toán CSCA](/blog/de-cuong-toan-csca).
- **Vật lý:** cơ học, điện từ học, nhiệt học, quang học, vật lý hiện đại. Xem [đề cương Vật lý CSCA](/blog/de-cuong-vat-ly-csca).
- **Hóa học:** khái niệm cơ bản và tính toán, tính chất và phản ứng, lý thuyết, thí nghiệm và ứng dụng. Xem [đề cương Hóa học CSCA](/blog/de-cuong-hoa-hoc-csca).
- **Tiếng Trung chuyên ngành:** đọc hiểu, từ vựng chuyên ngành, ngữ pháp và hoàn thành câu. Xem [Tiếng Trung chuyên ngành CSCA](/blog/tieng-trung-chuyen-nganh-csca).

## Nên chọn đề tiếng Trung hay tiếng Anh?

Chọn ngôn ngữ bạn đọc nhanh và chính xác hơn, nhưng **kiểm tra trường có bắt buộc đề tiếng Trung hay không**, nhất là với chương trình dạy bằng tiếng Trung. Dù chọn đề nào, hãy học thuật ngữ song ngữ để không mất thời gian dịch trong phòng thi. Bắt đầu với [thuật ngữ Lý – Hóa song ngữ](/blog/thuat-ngu-ly-hoa-csca-song-ngu) và [từ vựng Toán CSCA](/blog/tu-vung-toan-csca).

## Luyện đúng cấu trúc

Đề thi thử trên luyenthicsca.edu.vn được dựng theo cấu trúc trên: **48 câu/60 phút** cho Toán, Lý, Hóa và **80 câu/90 phút** cho Tiếng Trung chuyên ngành. Điểm quy đổi thang 100 chỉ là ước tính, không phải điểm chính thức. Làm [Quick Test miễn phí](/quick-test) để biết điểm xuất phát, rồi vào [trang đề thi thử](/thi-thu).
""")

# ---------------------------------------------------------------- 19
add(19, "2026-12-16", "lo-trinh-on-thi-csca-8-tuan",
    "Lộ trình ôn thi CSCA 8 tuần: từ bài kiểm tra đầu vào đến đề mô phỏng",
    "Lộ trình ôn thi CSCA 8 tuần: kế hoạch từng tuần cho Toán, Lý, Hóa",
    "Kế hoạch ôn thi CSCA 8 tuần chia theo từng giai đoạn: kiểm tra đầu vào, học theo mô-đun, luyện đề bấm giờ, sửa lỗi và đề mô phỏng cuối. Có bảng mẫu và mẹo duy trì.",
    "lộ trình ôn thi CSCA", ["ôn thi CSCA trong 2 tháng", "kế hoạch ôn CSCA", "cách ôn thi CSCA", "ôn CSCA từ đầu"], "Kỹ năng thi",
    """
Tám tuần là đủ để ôn có hệ thống nếu bạn đã học qua chương trình phổ thông và dành khoảng **1–2 giờ mỗi ngày**. Nếu còn ít thời gian hơn, hãy rút gọn tuần 2–5, nhưng đừng bỏ phần sửa lỗi và đề bấm giờ.

## Nguyên tắc của lộ trình

1. **Đo trước, học sau.** Bạn cần biết mô-đun nào yếu để không ôn dàn trải.
2. **Học theo mô-đun của đề cương.** Mỗi môn được chia thành vài mô-đun; ôn từng mô-đun rồi mới trộn.
3. **Bấm giờ từ sớm.** Mỗi câu chỉ có khoảng 75 giây, nên tốc độ phải được luyện, không thể để dồn đến cuối.
4. **Mỗi lỗi sai là một mục để ôn.** Ghi lại và quay lại sau vài ngày.

## Kế hoạch 8 tuần

| **Tuần** | **Mục tiêu** | **Việc cần làm** |
|---|---|---|
| 1 | Biết điểm xuất phát | Làm [Quick Test miễn phí](/quick-test); xem môn và mô-đun yếu nhất; đọc [cấu trúc đề thi CSCA](/blog/cau-truc-de-thi-csca) |
| 2–3 | Vá lỗ hổng kiến thức | Học lại mô-đun yếu nhất của từng môn; học thuật ngữ song ngữ ([Toán](/blog/tu-vung-toan-csca), [Lý – Hóa](/blog/thuat-ngu-ly-hoa-csca-song-ngu)) |
| 4–5 | Luyện theo mô-đun | Vào [Luyện tập](/luyen-tap), chọn môn và mô-đun, mỗi buổi 15–20 câu; xem lời giải mọi câu sai |
| 6 | Làm đề đầu tiên đúng điều kiện thật | Một đề mô phỏng 48 câu/60 phút, không máy tính, không tra cứu |
| 7 | Sửa lỗi có hệ thống | Làm lại các câu sai; luyện riêng dạng câu làm chậm; đọc [chiến thuật làm bài](/blog/chien-thuat-lam-bai-csca) |
| 8 | Tổng duyệt | Một đề mô phỏng thứ hai cách đề đầu ít nhất 5 ngày; so điểm và thời gian; nghỉ ngơi trước ngày thi |

## Mỗi buổi học nên thế nào?

- 10 phút: xem lại danh sách lỗi của hôm trước.
- 40–60 phút: học hoặc luyện một mô-đun.
- 10 phút: ghi lại 3 điều rút ra và các câu cần làm lại.

## Nếu thi cả Toán, Lý, Hóa và Tiếng Trung

Chia tuần theo môn, đừng học dồn một môn. Gợi ý: Toán 3 buổi, môn thứ hai 2 buổi, môn thứ ba 2 buổi mỗi tuần, còn Tiếng Trung chuyên ngành 15–20 phút mỗi ngày để duy trì vốn từ.

## Những sai lầm cần tránh

- Chỉ đọc lời giải mà không tự làm lại.
- Làm đề liên tục mà không sửa lỗi.
- Bỏ qua đề bấm giờ vì ngại điểm thấp. Điểm đầu tiên chỉ là xuất phát điểm.
- Học thuật ngữ quá muộn, dẫn đến đọc đề chậm.

Sẵn sàng bắt đầu? [Làm Quick Test miễn phí](/quick-test) để nhận chỉ số sẵn sàng và gợi ý lộ trình theo kết quả của bạn.
""")

# ---------------------------------------------------------------- 20
add(20, "2026-12-19", "cong-thuc-vat-ly-csca",
    "Công thức Vật lý cần nhớ cho CSCA: bảng tổng hợp theo mô-đun",
    "Công thức Vật lý CSCA cần nhớ: cơ, điện, nhiệt, quang, hạt nhân (có thuật ngữ tiếng Trung)",
    "Bảng công thức Vật lý ôn thi CSCA chia theo mô-đun: cơ học, điện từ học, nhiệt học, quang học, vật lý hiện đại, kèm thuật ngữ tiếng Trung, đơn vị và lỗi thường gặp.",
    "công thức vật lý CSCA", ["công thức vật lý ôn thi CSCA", "tóm tắt vật lý CSCA", "物理公式", "đề cương vật lý CSCA"], "Vật lý",
    """
Đề Vật lý CSCA gồm 48 câu trong 60 phút, vì vậy bạn cần thuộc công thức và biết kiểm tra đơn vị nhanh. Bảng dưới đây gom các công thức cơ bản theo mô-đun của đề cương. Đây là tóm tắt để ôn tập, hãy đối chiếu với đề cương chính thức của trường và đợt thi bạn dự thi.

## Cơ học (力学)

| **Nội dung** | **Công thức** | **Ghi chú** |
|---|---|---|
| Vận tốc cuối (末速度) | $v=v_0+at$ | $a$ là gia tốc, chú ý dấu |
| Quãng đường (位移) | $s=v_0t+\\tfrac12at^2$ | Chuyển động thẳng biến đổi đều |
| Định luật II Niu-tơn (牛顿第二定律) | $F=ma$ | $F$ là hợp lực |
| Trọng lực (重力) | $P=mg$ | $g\\approx 9{,}8$ hoặc $10\\ \\text{m/s}^2$ theo đề |
| Công (功) | $A=Fs\\cos\\alpha$ | Đơn vị J |
| Động năng (动能) | $W_đ=\\tfrac12mv^2$ | |
| Công suất (功率) | $P=\\dfrac{A}{t}$ | Đơn vị W |

## Điện từ học (电磁学)

| **Nội dung** | **Công thức** | **Ghi chú** |
|---|---|---|
| Định luật Ôm (欧姆定律) | $I=\\dfrac UR$ | |
| Điện trở nối tiếp | $R=R_1+R_2$ | |
| Điện trở song song | $\\dfrac1R=\\dfrac1{R_1}+\\dfrac1{R_2}$ | Hai điện trở: $R=\\dfrac{R_1R_2}{R_1+R_2}$ |
| Công suất điện (电功率) | $P=UI=I^2R$ | |
| Lực Lo-ren-xơ (洛伦兹力) | $F=qvB\\sin\\theta$ | |

## Nhiệt học (热学)

| **Nội dung** | **Công thức** | **Ghi chú** |
|---|---|---|
| Nhiệt lượng (热量) | $Q=mc\\Delta T$ | $c$ là nhiệt dung riêng (比热容) |
| Phương trình trạng thái khí lí tưởng | $pV=nRT$ | $T$ tính bằng kenvin |
| Cân bằng nhiệt hai vật | $m_1c_1(t_1-t)=m_2c_2(t-t_2)$ | Bỏ qua hao phí |

## Quang học (光学)

| **Nội dung** | **Công thức** | **Ghi chú** |
|---|---|---|
| Định luật khúc xạ (折射定律) | $n_1\\sin i=n_2\\sin r$ | |
| Góc giới hạn phản xạ toàn phần | $\\sin i_{gh}=\\dfrac{n_2}{n_1}$ | Chỉ khi $n_1>n_2$ |
| Công thức thấu kính (透镜公式) | $\\dfrac1f=\\dfrac1d+\\dfrac1{d'}$ | Xét dấu theo quy ước của đề |
| Khoảng vân giao thoa (干涉条纹间距) | $i=\\dfrac{\\lambda D}{a}$ | Đổi đơn vị trước khi tính |

## Vật lý hiện đại (近代物理)

| **Nội dung** | **Công thức** | **Ghi chú** |
|---|---|---|
| Năng lượng photon (光子能量) | $E=\\dfrac{hc}{\\lambda}$ | $hc\\approx1240\\ \\text{eV·nm}$ |
| Phương trình Anh-xtanh (光电效应方程) | $K_{max}=E-A$ | $A$ là công thoát |
| Định luật phóng xạ (放射性衰变) | $m=\\dfrac{m_0}{2^{t/T}}$ | $T$ là chu kì bán rã |
| Hệ thức khối lượng – năng lượng | $E=\\Delta m\\ c^2$ | $1\\ u=931{,}5\\ \\text{MeV}/c^2$ |

## Ba thói quen giúp tránh mất điểm

1. **Kiểm tra đơn vị trước khi chọn đáp án.** Nhiều đáp án nhiễu sai thứ nguyên hoặc sai bậc độ lớn 10, 1000.
2. **Đổi đơn vị ngay từ đầu:** nm sang m, mm sang m, cm sang m, mL sang L.
3. **Ước lượng bậc độ lớn** để loại 1–2 phương án trước khi tính.

Học xong, hãy [luyện tập theo mô-đun Vật lý](/luyen-tap) hoặc xem [đề cương Vật lý CSCA](/blog/de-cuong-vat-ly-csca) và [mẫu đề Vật lý CSCA](/blog/mau-de-vat-ly-csca). Thuật ngữ song ngữ đầy đủ hơn nằm trong bài [Thuật ngữ Lý – Hóa song ngữ](/blog/thuat-ngu-ly-hoa-csca-song-ngu).
""")

# ---------------------------------------------------------------- 22
add(22, "2026-12-22", "thuat-ngu-ly-hoa-csca-song-ngu",
    "Thuật ngữ Vật lý – Hóa học CSCA song ngữ Việt – Trung – Anh",
    "Từ vựng Vật lý, Hóa học CSCA: bảng thuật ngữ Việt – Trung – Anh",
    "Bảng thuật ngữ Vật lý và Hóa học thường gặp trong đề CSCA bằng tiếng Việt, tiếng Trung (kèm chữ Hán) và tiếng Anh, cùng dụng cụ thí nghiệm và mẹo học nhanh.",
    "từ vựng vật lý hóa học CSCA", ["thuật ngữ vật lý tiếng Trung", "từ vựng hóa học tiếng Trung", "物理 化学 词汇", "CSCA thuật ngữ song ngữ"], "Tiếng Trung chuyên ngành",
    """
Đề CSCA có bản tiếng Trung và bản tiếng Anh. Nếu bạn học các môn này bằng tiếng Việt, việc làm quen thuật ngữ song ngữ giúp đọc đề nhanh hơn, tiết kiệm vài giây mỗi câu. Bài này liệt kê thuật ngữ thường gặp. Giống [từ vựng Toán CSCA](/blog/tu-vung-toan-csca), mỗi từ gồm tiếng Việt – chữ Hán – tiếng Anh.

## Vật lý

| **Tiếng Việt** | **中文** | **English** |
|---|---|---|
| Vận tốc | 速度 | velocity |
| Gia tốc | 加速度 | acceleration |
| Lực | 力 | force |
| Công | 功 | work |
| Công suất | 功率 | power |
| Động năng | 动能 | kinetic energy |
| Thế năng | 势能 | potential energy |
| Điện trở | 电阻 | resistance |
| Cường độ dòng điện | 电流 | current |
| Hiệu điện thế | 电压 | voltage |
| Điện trường | 电场 | electric field |
| Từ trường | 磁场 | magnetic field |
| Cảm ứng điện từ | 电磁感应 | electromagnetic induction |
| Nhiệt dung riêng | 比热容 | specific heat capacity |
| Bước sóng | 波长 | wavelength |
| Tần số | 频率 | frequency |
| Khúc xạ | 折射 | refraction |
| Phản xạ | 反射 | reflection |
| Giao thoa | 干涉 | interference |
| Nhiễu xạ | 衍射 | diffraction |
| Thấu kính | 透镜 | lens |
| Chiết suất | 折射率 | refractive index |
| Hạt nhân | 原子核 | nucleus |
| Phóng xạ | 放射性 | radioactivity |
| Chu kì bán rã | 半衰期 | half-life |
| Photon | 光子 | photon |

## Hóa học

| **Tiếng Việt** | **中文** | **English** |
|---|---|---|
| Nguyên tử | 原子 | atom |
| Phân tử | 分子 | molecule |
| Ion | 离子 | ion |
| Mol | 摩尔 | mole |
| Nồng độ | 浓度 | concentration |
| Dung dịch | 溶液 | solution |
| Axit | 酸 | acid |
| Bazơ | 碱 | base |
| Muối | 盐 | salt |
| Oxi hóa | 氧化 | oxidation |
| Khử | 还原 | reduction |
| Chất xúc tác | 催化剂 | catalyst |
| Tốc độ phản ứng | 反应速率 | reaction rate |
| Cân bằng hóa học | 化学平衡 | chemical equilibrium |
| Bảng tuần hoàn | 元素周期表 | periodic table |
| Điện li | 电离 | ionization |
| Kết tủa | 沉淀 | precipitate |
| Chuẩn độ | 滴定 | titration |
| Điều kiện tiêu chuẩn | 标准状况 | standard temperature and pressure |

## Dụng cụ thí nghiệm

| **Tiếng Việt** | **中文** | **English** |
|---|---|---|
| Ống nghiệm | 试管 | test tube |
| Cốc thủy tinh | 烧杯 | beaker |
| Bình định mức | 容量瓶 | volumetric flask |
| Buret | 滴定管 | burette |
| Phễu chiết | 分液漏斗 | separatory funnel |
| Đèn cồn | 酒精灯 | alcohol burner |

## Cách học nhanh

1. **Học theo cụm:** ví dụ nhóm điện (điện trở, dòng điện, hiệu điện thế) rồi mới sang nhóm quang.
2. **Đọc cả hai chiều:** nhìn chữ Hán đoán nghĩa, rồi nhìn nghĩa đoán chữ Hán.
3. **Gắn vào câu hỏi:** gặp từ lạ trong đề, ghi lại và bổ sung vào danh sách.
4. **Ôn cách quãng:** 10 từ mỗi ngày, ôn lại sau 1 ngày, 3 ngày, 7 ngày.

Kết hợp với [công thức Vật lý](/blog/cong-thuc-vat-ly-csca) và [đề cương Hóa học](/blog/de-cuong-hoa-hoc-csca). Muốn biết vốn từ của mình đã đủ chưa, [làm Quick Test miễn phí](/quick-test).
""")

# ---------------------------------------------------------------- 23
add(23, "2026-12-25", "thi-thu-csca-online-mien-phi",
    "Thi thử CSCA online miễn phí: nên bắt đầu từ đâu?",
    "Thi thử CSCA online miễn phí: đề, cách chấm và cách dùng kết quả",
    "Hướng dẫn thi thử CSCA online miễn phí: Quick Test, đề luyện Mức 1 và đề mô phỏng số 01 mỗi môn; điểm quy đổi hiểu thế nào, giới hạn của đề thi thử và cách dùng kết quả.",
    "thi thử CSCA online", ["thi thử CSCA miễn phí", "đề thi thử CSCA", "luyện đề CSCA online", "CSCA mock test"], "Kỹ năng thi",
    """
Muốn biết mình đang ở đâu, cách nhanh nhất là làm một bài thi thử. Trên luyenthicsca.edu.vn có ba tầng miễn phí, nên bắt đầu theo thứ tự dưới đây.

## 1. Quick Test (khoảng 15 phút)

Bài kiểm tra nhanh cho kết quả ngay: **chỉ số sẵn sàng CSCA**, điểm mạnh – yếu theo môn và gợi ý mức luyện phù hợp. Đây là bước nên làm đầu tiên. [Làm Quick Test miễn phí](/quick-test).

## 2. Đề luyện theo mức

Đề luyện được chia thành **bốn mức** từ Nền tảng đến Chinh phục, với tỉ lệ câu dễ – trung bình – khó khác nhau. **Mức 1 là miễn phí.** Làm Mức 1 để làm quen định dạng, xem lời giải và cách hệ thống phân tích lỗi.

## 3. Đề mô phỏng đúng cấu trúc

Đề mô phỏng theo cấu trúc kỳ thi thật: **48 câu/60 phút** cho Toán, Lý, Hóa và **80 câu/90 phút** cho Tiếng Trung chuyên ngành. **Đề số 01 của mỗi môn miễn phí.** Hãy làm đúng điều kiện thật: bấm giờ, không máy tính, không tra cứu. Xem [chi tiết cấu trúc đề](/blog/cau-truc-de-thi-csca) trước khi làm.

## Điểm thang 100 nghĩa là gì?

Điểm quy đổi thang 100 trên đề mô phỏng chỉ là **ước tính** để bạn theo dõi tiến bộ, **không phải điểm chính thức** của CSCA. Đừng dùng con số này để dự đoán điểm thi thật, mà hãy dùng để so sánh các lần làm của chính bạn.

## Giới hạn cần biết

- Đề trên nền tảng là **đề mô phỏng theo đề cương**, không phải đề thi thật hay đề thi các năm trước.
- Câu hỏi được soạn bằng công cụ và khuôn câu hỏi có kiểm tra tự động; quá trình giáo viên xác nhận toàn bộ ngân hàng đang được thực hiện dần. Nếu thấy câu nghi ngờ, bạn có thể bấm báo lỗi ngay trên câu hỏi.
- Mức độ khó của đề mô phỏng là ước lượng.

## Dùng kết quả thế nào?

1. Xem mô-đun nào sai nhiều nhất, đó là thứ tự ưu tiên ôn.
2. Làm lại các câu sai sau 2–3 ngày.
3. Sau khi sửa lỗi, làm đề tiếp theo và so sánh điểm cùng thời gian.
4. Theo [lộ trình ôn thi CSCA 8 tuần](/blog/lo-trinh-on-thi-csca-8-tuan) nếu bạn cần kế hoạch cụ thể.

Bắt đầu ngay tại [trang đề thi thử](/thi-thu), hoặc làm [Quick Test](/quick-test) nếu đây là lần đầu.
""")

# ---------------------------------------------------------------- 24
add(24, "2026-12-28", "csca-va-ho-so-du-hoc-trung-quoc",
    "CSCA và hồ sơ du học Trung Quốc: cần chuẩn bị gì và theo thứ tự nào?",
    "CSCA và hồ sơ du học Trung Quốc: điểm thi dùng vào đâu, chuẩn bị thế nào",
    "CSCA nằm ở đâu trong hồ sơ du học đại học Trung Quốc: kiểm tra yêu cầu của trường, chọn môn và đợt thi, thời điểm có điểm và các giấy tờ cần chuẩn bị song song.",
    "CSCA hồ sơ du học Trung Quốc", ["du học Trung Quốc bậc đại học", "điểm CSCA dùng làm gì", "yêu cầu CSCA của trường", "học bổng du học Trung Quốc"], "Thông tin kỳ thi",
    """
CSCA là một phần trong bộ hồ sơ du học đại học Trung Quốc. Nhiều trường dùng điểm CSCA để xét tuyển, nhưng **yêu cầu cụ thể khác nhau theo trường, ngành và năm tuyển sinh**. Vì vậy thứ tự đúng là xác định yêu cầu trước, rồi mới chọn môn và đợt thi.

## Bước 1: Xác định yêu cầu của trường và ngành

Với từng trường bạn nhắm tới, tìm trong thông báo tuyển sinh của năm bạn nộp hồ sơ:

- Có yêu cầu CSCA không, và với ngành nào?
- Môn bắt buộc (Toán, Vật lý, Hóa học, Tiếng Trung chuyên ngành) và khối Văn hay khối Khoa học.
- Ngôn ngữ đề được phép chọn (tiếng Trung hay tiếng Anh).
- Điểm tối thiểu hoặc cách tính điểm vào xét tuyển (nếu có công bố).
- Hạn nộp hồ sơ và hạn nộp điểm CSCA.

Hãy lập một bảng so sánh các trường để không bỏ sót điều kiện nào.

## Bước 2: Chọn môn và đợt thi

Từ bảng yêu cầu, chọn tập môn thi **thỏa yêu cầu của tất cả trường bạn muốn nộp**. Lệ phí tính theo số môn trong một lần đăng ký (xem [lệ phí thi CSCA](/blog/le-phi-thi-csca)). Chọn đợt thi để có điểm trước hạn nộp, và để dành một đợt dự phòng nếu cần thi lại. Xem [lịch thi CSCA 2027](/blog/lich-thi-csca-2027) và nhớ đối chiếu với csca.cn vì lịch có thể thay đổi.

## Bước 3: Đăng ký và chuẩn bị song song

Đăng ký theo hướng dẫn trong bài [đăng ký thi CSCA](/blog/dang-ky-thi-csca). Trong lúc ôn thi, chuẩn bị luôn các giấy tờ hồ sơ mà trường yêu cầu: hộ chiếu, học bạ và bằng cấp, chứng chỉ ngoại ngữ nếu có, thư giới thiệu, bài luận. Nên bắt đầu sớm vì một số giấy tờ cần dịch và công chứng.

## Bước 4: Ôn thi có kế hoạch

Dành ít nhất 6–8 tuần ôn có hệ thống theo [lộ trình ôn thi CSCA 8 tuần](/blog/lo-trinh-on-thi-csca-8-tuan). Làm [Quick Test](/quick-test) để biết điểm xuất phát, sau đó luyện [đề thi thử](/thi-thu) đúng cấu trúc.

## Bước 5: Theo dõi kết quả và nộp hồ sơ

Sau khi có điểm, đối chiếu lại với yêu cầu của từng trường và nộp hồ sơ đúng hạn. Nếu điểm chưa đạt kỳ vọng và còn đợt thi trước hạn, cân nhắc thi lại sau khi sửa các lỗi chính.

## Lưu ý quan trọng

Thông tin trong bài là hướng dẫn chung. Quy định có thể thay đổi giữa các năm; hãy luôn xác nhận trên **trang chính thức csca.cn** và **thông báo tuyển sinh của chính trường** trước khi quyết định.

Bạn có thể xem thông tin các trường trên mục [Trường đại học](/truong) và [Học bổng](/hoc-bong) của luyenthicsca.edu.vn để có bức tranh ban đầu.
""")

out = pathlib.Path(__file__).resolve().parent.parent / "content" / "seo" / "posts-extra.json"
out.write_text(json.dumps(posts, ensure_ascii=False, indent=1), encoding="utf-8")
print("Đã ghi", len(posts), "bài →", out)
