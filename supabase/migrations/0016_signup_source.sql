-- Nguồn đăng ký (first-touch): utm_source/medium/campaign, tên miền giới thiệu, trang đích đầu tiên
alter table profiles add column if not exists signup_source jsonb;
