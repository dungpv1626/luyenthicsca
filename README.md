# Luyenthicsca – MVP giai đoạn 1

Hệ thống đánh giá và nâng cao năng lực CSCA: **Thi thử → Chấm điểm → AI phân tích → Luyện tập → Thi lại**.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · Supabase (Auth + Postgres) · Claude API.

## Phạm vi MVP (theo tài liệu §XVII)
Homepage · Tài khoản (đăng ký/đăng nhập, hồ sơ, mục tiêu) · Question Bank (CRUD + quy trình Draft→Review→Approved) ·
Mock Test Engine (random đề, timer, tự lưu, nộp bài) · Chấm điểm tự động (Readiness Score) · AI Assessment (Claude, có fallback theo luật) ·
Thanh toán (đơn hàng + VietQR + webhook tự xác nhận / xác nhận tay) · Admin (Dashboard, Question Bank, Mock Test, Đơn hàng, Người dùng, phân quyền 5 vai trò) ·
Luyện tập theo môn/chủ đề/độ khó · Dashboard học sinh.

## Phase 2 (đã làm)
AI CSCA (hồ sơ năng lực, biểu đồ tiến bộ, bản đồ kỹ năng) · AI Study Plan (Claude lập lộ trình theo ngày, nhiệm vụ tự hoàn thành khi nộp bài) ·
AI Tutor (chat + hỏi từng câu trong kết quả, 30 lượt/ngày) · Câu đã sai · School & Scholarship Database (lọc, so sánh, đối chiếu hồ sơ, đăng ký tư vấn) ·
Academy (khóa học, bài giảng video/nội dung, quiz, tiến độ, mua khóa) · Admin: Analytics, Leads, CRUD trường/học bổng/khóa học/bài giảng/giáo viên.

Phase 3 (Adaptive Test, AI Question Generator, B2B/School Dashboard, Mobile App, API) và Blog chưa làm.

Database: chạy thêm `supabase/migrations/0002_phase2.sql` và (tùy chọn) `supabase/seed_phase2.sql`.
Seed trường **không chứa** mức chuẩn CSCA — nhập từ thông báo chính thức ở Admin → Trường.

## Chạy thử
```bash
npm install
cp .env.example .env.local   # điền khóa Supabase, Anthropic, ngân hàng
```
1. Tạo project Supabase → SQL Editor: chạy `supabase/migrations/0001_init.sql`, rồi (tùy chọn) `supabase/seed.sql` để có câu hỏi mẫu.
2. Authentication → tắt "Confirm email" nếu muốn đăng ký xong vào luôn khi thử nghiệm.
3. Đăng ký một tài khoản, rồi nâng thành admin:
   ```sql
   update profiles set role = 'super_admin' where id = (select id from auth.users where email = 'you@example.com');
   ```
4. `npm run dev` → http://localhost:3000

Kiểm tra: `npm run typecheck && npm test && npm run build`.

## Thanh toán
Đơn hàng sinh mã `LTCxxxxxx` làm nội dung chuyển khoản, hiển thị VietQR. Hai cách mở khóa đề:
- **Tự động:** cấu hình webhook của SePay (hoặc dịch vụ tương tự) trỏ tới `POST /api/payment/webhook` với header `Authorization: Apikey $PAYMENT_WEBHOOK_KEY`.
- **Thủ công:** Admin → Đơn hàng → "Xác nhận đã thu".

Có thể thay bằng cổng khác (PayOS, VNPay…) bằng cách gọi `markOrderPaid()` trong `src/lib/orders.ts`.

## Công thức Readiness Score
`80% × độ chính xác (trọng số Easy 1 / Medium 1.5 / Hard 2) + 20% × tốc độ` (thời gian dự kiến ÷ thời gian thực). Xem `src/lib/scoring.ts`.

## Bảo mật
Đáp án đúng không bao giờ gửi xuống trình duyệt khi đang làm bài; bảng `questions` không có RLS policy (chỉ server/service role đọc).
Server kiểm tra quyền admin theo vai trò, từ chối đáp án nộp muộn quá hạn.
**Không commit `.env.local`; `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server.**

## Triển khai Cloudflare (Workers)
Dùng `@opennextjs/cloudflare`. Cần gói **Workers Paid** cho bản chạy thật (giới hạn CPU/kích thước của gói miễn phí quá thấp).
```bash
npm run cf:preview   # chạy thử bằng workerd (đặt khóa trong .dev.vars, không commit)
npm run cf:deploy    # build + deploy; cần CLOUDFLARE_API_TOKEN và CLOUDFLARE_ACCOUNT_ID.
                     # Script tạm gỡ .env.local để KHÔNG nhúng khóa bí mật vào mã Worker (OpenNext ghi mọi file .env* vào bundle).
```
Biến không bí mật nằm trong `wrangler.jsonc`. Khóa bí mật đặt bằng `npx wrangler secret put <TÊN>`:
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `PAYMENT_ACCOUNT_NO`, `PAYMENT_WEBHOOK_KEY`.
Chạy `npm run cf:build` khi đã có `.env.local`: biến `NEXT_PUBLIC_*` được nhúng vào bản build tại thời điểm build.


## Ngân hàng câu hỏi (4 môn × 300 câu, 3 ngôn ngữ Việt–Anh–Trung)
Migration: `0003a_enum.sql` rồi `0003b_question_bank.sql`; blueprint nháp: `seed_blueprint.sql` (cần đối chiếu đặc tả chính thức của CSCA).

Sinh câu hỏi GỐC bằng Claude, luôn vào hàng chờ duyệt (không bao giờ tự "Đã duyệt"):
```bash
node --env-file=.env.local scripts/generate-questions.mjs --pilot                 # lô thử 40 câu
node --env-file=.env.local scripts/generate-questions.mjs --fill --subject math --max 60   # lấp thiếu hụt theo blueprint (dư 30%)
node --env-file=.env.local scripts/generate-questions.mjs --reverify              # kiểm tra lại câu bị cờ
```
Mỗi câu: 3 ngôn ngữ tương đương → xáo trộn đáp án (đổi `[[X]]` trong lời giải) → giải độc lập → chống trùng → hàng chờ.
Giáo viên duyệt tại **Admin → Duyệt câu hỏi** (xem đủ 3 ngôn ngữ, duyệt/loại kèm lý do). Tiến độ: **Admin → Blueprint**.
Công thức dùng LaTeX `$...$` (KaTeX). Giải độc lập bằng cùng một model chỉ là bước sàng lọc, KHÔNG thay giáo viên.


## Khuôn câu hỏi tham số (Toán / Vật lý / Hóa học)

Ngoài câu do AI soạn, hệ thống có **57 khuôn** (`src/lib/templates/`): mỗi khuôn là một dạng bài có tham số; **đáp án và các đáp án nhiễu do mã tính** (không gọi API, không tốn tiền), đề + lời giải có đủ Việt–Anh–Trung.

- Sinh biến thể: `node --env-file=.env.local scripts/generate-from-templates.mjs --dry` (xem số lượng) · `--show <key>` (in thử) · `--publish` (ghi và công bố ngay).
- Mỗi khuôn chỉ lấy tối đa ½ số biến thể duy nhất (tối đa 100) để tránh đề na ná nhau; khuôn ít biến thể (<50) chỉ lấy 8.
- Giáo viên duyệt **theo khuôn** tại Admin → *Khuôn câu hỏi*: duyệt = xác nhận toàn bộ biến thể; loại = gỡ toàn bộ biến thể.
- Kiểm thử: `npm test` (mỗi khuôn sinh 400 biến thể: 4 đáp án khác nhau, đủ 3 ngôn ngữ, lời giải chứa đáp án đúng; đối chiếu các công thức bằng cách tính khác). Mọi công thức LaTeX sinh ra đã được KaTeX (strict) phân tích thử, 0 lỗi.
- Thêm khuôn mới: viết `add({ key, subject, topic, subtopic, difficulty, build })` trong `math.ts` / `physics.ts` / `chemistry.ts` / `extra.ts` (xác suất–thống kê, quang học, vật lý hiện đại, thí nghiệm hóa); `build` trả `null` khi tham số không hợp lệ.

## Blueprint theo mô-đun đề cương CSCA

- `src/lib/syllabus.ts`: các **mô-đun theo đề cương** (Toán 4, Vật lý 5, Hóa học 4; Professional Chinese 3 nhóm theo cách ngân hàng phân loại), quy tắc gán mô-đun cho từng câu và hạn ngạch theo tỉ trọng. **Tỉ trọng là ước lượng**: đề cương không công bố số câu theo mô-đun. Cấu trúc mô-đun lấy từ các bài hướng dẫn đề cương 2025, chưa đối chiếu trực tiếp với file PDF chính thức.
- `questions.module`: khóa mô-đun, `out` = ngoài phần liệt kê của đề cương (vd tích phân, nhiệt hóa học, điện phân; vẫn dùng để luyện tập, không đưa vào đề mô phỏng).
- Gán lại mô-đun: `node --env-file=.env.local scripts/backfill-modules.mjs` (in luôn bảng phủ đề cương). Bộ sinh câu hỏi tự gán mô-đun cho câu mới.
- Đề mô phỏng lắp theo hạn ngạch mô-đun (`src/lib/assemble-modules.ts`); `--max-shift 2`: đề lệch quá 2 câu so với hạn ngạch thì không dựng. Dựng lại: `node --env-file=.env.local scripts/build-sim-exams.mjs --replace` (chỉ xóa đề chưa có lượt làm).
- Học viên: chi tiết đề mô phỏng hiện cơ cấu theo mô-đun; kết quả hiện đúng/sai theo mô-đun và nút luyện mô-đun yếu nhất; Luyện tập lọc được theo mô-đun. Quản trị: Admin → Blueprint có bảng phủ đề cương.

## Đề mô phỏng CSCA

Khác với các **mức luyện tập** (Mức 1–4, do chúng tôi đặt ra để học từ dễ đến khó; kỳ thi thật **không** chia cấp độ), đề mô phỏng bám khuôn của kỳ thi: Toán, Vật lý, Hóa học **48 câu / 60 phút**; Professional Chinese **80 câu / 90 phút**; mỗi môn một bài riêng, điểm quy đổi thang 100 (`src/lib/sim.ts`). Số câu và thời gian theo thông tin công bố; cơ cấu độ khó (30/50/20) là ước lượng của chúng tôi.

- Dựng đề: `node --env-file=.env.local scripts/build-sim-exams.mjs --dry` rồi chạy không `--dry`. Các đề không trùng câu với nhau; câu sinh từ khuôn tham số chỉ chiếm tối đa ½ số câu còn lại để đề đa dạng.
- Đề 01 mỗi môn: miễn phí và đã công bố. Các đề còn lại: **ẩn**, 49.000đ, chờ giáo viên duyệt mẫu.
- Trang kết quả của đề mô phỏng hiện điểm quy đổi thang 100, thời gian trung bình mỗi câu so với chuẩn thi thật.

## Blog SEO (kế hoạch 60 bài)

- Nguồn: `content/seo/*.docx` → `python3 scripts/seo_docx_to_json.py` (cần `pandoc`) → `content/seo/posts.json` → `node --env-file=.env.local scripts/import-seo-posts.mjs` (nhập bài mới ở trạng thái **nháp**, không ghi đè bài đã sửa; `--force` để ghi đè).
- Trang công khai: `/blog`, `/blog/[slug]` (title/meta riêng, canonical, Open Graph, JSON-LD Article + BreadcrumbList), `sitemap.xml`, `robots.txt`. Địa chỉ gốc SEO cố định ở `src/lib/seo.ts`.
- Quản trị: Admin → Blog SEO. Mỗi bài: Xem trước (chỉ nhân viên nội dung), Sửa, Lên lịch (hiển thị tự động 9:00 giờ Việt Nam vào ngày dự kiến), Công bố ngay, Gỡ về nháp.
- **Chặn công bố** khi bài còn “[CẦN XÁC MINH …]”, “[CHÈN …]”, “đội ngũ giáo viên”, “do bạn cung cấp” (xem `reviewFlags` trong `src/lib/blog-utils.ts`).

## Bộ đề theo cấp
4 cấp (`src/lib/levels.ts`): **1 Nền tảng** (dễ 70/TB 30/khó 0) · **2 Cơ bản** (40/50/10) · **3 Nâng cao** (15/50/35) · **4 Mô phỏng thi** (35/45/20).
Mỗi cấp có đề **theo môn** và đề **tổng hợp 4 môn**. Migration: `0004_levels.sql`.
- Admin → **Đề theo cấp**: chọn cấp, phạm vi, số đề, số câu, thời gian, giá → hệ thống lắp đề từ câu **Đã duyệt**
  (đúng cơ cấu độ khó, dàn đều chủ đề, không trùng câu giữa các đề cùng cấp). Đề tạo ở trạng thái ẩn, kiểm tra rồi **Công bố**.
- Thiếu câu → báo rõ môn nào thiếu bao nhiêu; có tùy chọn "nới lỏng" (bù độ khó/dùng lại câu) khi ngân hàng còn nhỏ.
- Học sinh: `/thi-thu` nhóm theo cấp, lọc theo môn, gợi ý cấp theo Readiness gần nhất, hiện điểm cao nhất đã đạt.
- Kích thước đề mặc định (30 câu/45′ theo môn; 15 câu mỗi môn/90′ tổng hợp) chỉ là gợi ý, cần chỉnh theo đặc tả chính thức.

## Blog SEO: nguồn bài và quy trình

- `content/seo/posts.json`: 17 bài chuyển từ tài liệu docx (`python3 scripts/seo_docx_to_json.py`; chạy lại sẽ ghi đè các sửa tay trong file này).
- `content/seo/posts-extra.json`: bài viết thêm, sinh từ `python3 scripts/seo_new_posts.py` (sửa nội dung trong script rồi chạy lại).
- Nhập vào DB (trạng thái nháp, không ghi đè bài đã có): `node --env-file=.env.local scripts/import-seo-posts.mjs`.
- Công thức `$...$` trong bài được KaTeX hiển thị (`src/components/Markdown.tsx`). Tránh `\,` trong công thức (Markdown coi là ký tự thoát), dùng `\ `.
- Trước khi công bố: đối chiếu lịch thi, lệ phí, danh sách điểm thi với csca.cn; admin hiển thị cảnh báo nếu bài còn dòng giữ chỗ hoặc câu chưa nên công bố.

## Đo lường website và SEO

- **Nguồn đăng ký (tự đo, không bên thứ ba):** `AttributionTracker` ghi nguồn truy cập đầu tiên (utm_source/medium/campaign, tên miền giới thiệu, trang đích) vào cookie `lt_attr` 30 ngày; `signUp` lưu vào `profiles.signup_source` (migration `0016_signup_source.sql`). Admin → Phân tích → “Nguồn đăng ký” cho biết nguồn và bài blog nào mang về đăng ký, người làm bài, người mua. Gắn `?utm_source=…&utm_medium=…` vào liên kết quảng cáo/bài đăng.
- **Cloudflare Web Analytics:** đặt `NEXT_PUBLIC_CF_BEACON_TOKEN` trong `.env.local` rồi triển khai lại (không có biến thì không gắn script).
- **Google Search Console:** đặt `NEXT_PUBLIC_GSC_VERIFICATION` (nội dung thẻ xác minh) rồi triển khai lại; sau đó gửi `https://luyenthicsca.edu.vn/sitemap.xml`.

## Lộ trình dạng đường ống (6 chặng)

`/lo-trinh` mở đầu bằng **đường ống nhiều chặng**: Đo năng lực → Đặt mục tiêu và lộ trình → Vá lỗ hổng theo chuyên đề → Luyện đề theo mức → Đề mô phỏng → Tổng duyệt trước ngày thi. Mỗi chặng có trạng thái (đã xong / đang ở đây / chưa tới), tiến độ và việc còn phải làm; máy bay chỉ chặng đang ở. Máy tính xếp ngang (thẻ xen kẽ trên/dưới), điện thoại xếp dọc; dashboard có bản thu nhỏ.

- Logic thuần: `src/lib/journey.ts` (có test). Ngưỡng chỉnh ở đầu file: `PRACTICE_GOAL` (6 buổi luyện chuyên đề), `LEVEL_GOAL` (3 đề theo mức), `LEVEL_PASS` (60/100), `SIM_GOAL` (2 đề mô phỏng). Điểm mục tiêu lấy từ lộ trình AI (mặc định 80).
- Dữ liệu: `src/lib/journey-data.ts` (bài đã nộp, hồ sơ, lộ trình, chủ đề yếu). Giao diện: `src/components/JourneyPipeline.tsx`.
- Chặng "Vá lỗ hổng" chỉ xong khi đủ buổi luyện VÀ hết chuyên đề yếu (dưới 60%); chặng "Luyện đề theo mức" cần 3 đề và đạt từ 60/100.
