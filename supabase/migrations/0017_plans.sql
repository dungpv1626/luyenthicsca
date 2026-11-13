-- Gói đăng ký theo năm (Starter / Pro / Max). Quyền truy cập suy ra từ đơn đã thanh toán, không cần bảng riêng:
-- gói còn hiệu lực = đơn paid có plan và paid_at + 365 ngày > hiện tại. Hoàn tiền (refunded) tự động thu hồi quyền.
alter table orders add column if not exists plan text check (plan in ('starter','pro','max'));
alter table orders drop constraint if exists orders_one_item;
alter table orders add constraint orders_one_item check (((test_id is not null)::int + (course_id is not null)::int + (plan is not null)::int) = 1);
create index if not exists orders_user_plan_idx on orders (user_id, plan) where plan is not null;
