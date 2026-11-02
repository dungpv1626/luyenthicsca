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


## Bộ đề theo cấp
4 cấp (`src/lib/levels.ts`): **1 Nền tảng** (dễ 70/TB 30/khó 0) · **2 Cơ bản** (40/50/10) · **3 Nâng cao** (15/50/35) · **4 Mô phỏng thi** (35/45/20).
Mỗi cấp có đề **theo môn** và đề **tổng hợp 4 môn**. Migration: `0004_levels.sql`.
- Admin → **Đề theo cấp**: chọn cấp, phạm vi, số đề, số câu, thời gian, giá → hệ thống lắp đề từ câu **Đã duyệt**
  (đúng cơ cấu độ khó, dàn đều chủ đề, không trùng câu giữa các đề cùng cấp). Đề tạo ở trạng thái ẩn, kiểm tra rồi **Công bố**.
- Thiếu câu → báo rõ môn nào thiếu bao nhiêu; có tùy chọn "nới lỏng" (bù độ khó/dùng lại câu) khi ngân hàng còn nhỏ.
- Học sinh: `/thi-thu` nhóm theo cấp, lọc theo môn, gợi ý cấp theo Readiness gần nhất, hiện điểm cao nhất đã đạt.
- Kích thước đề mặc định (30 câu/45′ theo môn; 15 câu mỗi môn/90′ tổng hợp) chỉ là gợi ý, cần chỉnh theo đặc tả chính thức.
