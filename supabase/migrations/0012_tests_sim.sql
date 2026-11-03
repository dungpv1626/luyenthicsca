-- Đề mô phỏng CSCA: đúng khuôn thi thật (48 câu/60 phút; Chinese 80 câu/90 phút), điểm quy đổi thang 100
alter table tests add column if not exists sim boolean not null default false;
