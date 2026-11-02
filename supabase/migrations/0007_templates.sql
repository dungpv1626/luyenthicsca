-- Khuôn câu hỏi có tham số: biến thể sinh bằng mã, giáo viên duyệt theo KHUÔN
alter table questions drop constraint if exists questions_origin_check;
alter table questions add constraint questions_origin_check check (origin in ('ai_generated','teacher','open_source','template'));
alter table questions add column template_key text, add column params jsonb;
create index on questions (template_key) where template_key is not null;

create table template_reviews (
  template_key text primary key,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer uuid references profiles(id),
  note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table template_reviews enable row level security;   -- chỉ service role
