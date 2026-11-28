-- Gói dịch vụ theo Chính sách giá đã công bố (Mức 2–5) và ghi nhận đồng ý điều khoản khi đăng ký.
-- Thay thế 0017_plans.sql (chạy được cả khi 0017 đã hoặc chưa chạy). Chạy một lần trong SQL Editor của Supabase.

-- 1) Đơn hàng mua gói: mã gói + môn (chỉ Gói theo môn có môn).
alter table orders add column if not exists plan text;
alter table orders add column if not exists plan_subject text;
alter table orders drop constraint if exists orders_plan_check;
alter table orders add constraint orders_plan_check check (plan is null or plan in ('co_ban','theo_mon','tron_bo','dong_hanh'));
alter table orders drop constraint if exists orders_plan_subject_check;
alter table orders add constraint orders_plan_subject_check check (
  (plan = 'theo_mon' and plan_subject in ('math','physics','chemistry','chinese')) or
  (plan is distinct from 'theo_mon' and plan_subject is null)
);
alter table orders drop constraint if exists orders_one_item;
alter table orders add constraint orders_one_item check (((test_id is not null)::int + (course_id is not null)::int + (plan is not null)::int) = 1);
create index if not exists orders_user_plan_idx on orders (user_id, plan) where plan is not null;

-- 2) Đồng ý Điều khoản sử dụng và Chính sách bảo mật khi đăng ký; đồng ý nhận tin khuyến mại (tùy chọn).
alter table profiles add column if not exists terms_accepted_at timestamptz;
alter table profiles add column if not exists marketing_opt_in boolean not null default false;
