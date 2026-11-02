-- Nhân quy mô ngân hàng câu hỏi (×10) + công bố trước, giáo viên xác nhận sau + báo lỗi

-- Chủ đề con (đa dạng có cấu trúc) và cờ "công bố tự động chưa có giáo viên xác nhận"
alter table questions
  add column subtopic text,
  add column auto_published boolean not null default false;   -- true = đang công bố nhưng chưa ai duyệt
create index on questions (subject, topic, subtopic);
create index on questions (auto_published) where auto_published;

-- Học sinh báo lỗi câu hỏi (mỗi người chỉ báo một lần cho một câu)
create table question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  reason text not null default 'wrong_answer' check (reason in ('wrong_answer','unclear','bad_translation','other')),
  note text,
  created_at timestamptz not null default now(),
  unique (question_id, user_id)
);
create index on question_reports (question_id);
alter table question_reports enable row level security;   -- chỉ service role

-- Mục tiêu blueprint ×10 (300 → 3.000 câu mỗi môn)
update blueprint set target_count = target_count * 10;
