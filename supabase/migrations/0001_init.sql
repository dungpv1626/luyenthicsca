-- LUYENTHICSCA MVP schema
create type user_role as enum ('super_admin','content_manager','academic_reviewer','sales','student');
create type question_status as enum ('draft','review','approved');
create type attempt_kind as enum ('quick','mock','practice');
create type order_status as enum ('pending','paid','cancelled','refunded');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  audience text,            -- lop11 | lop12 | tot_nghiep | sinh_vien | hoc_tieng_trung | chua_biet
  target text,              -- mục tiêu (vd: Đại học Trung Quốc)
  exam_date date,
  role user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  subject text not null check (subject in ('math','physics','chemistry','chinese')),
  topic text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  language text not null default 'vi' check (language in ('vi','en','zh')),
  body text not null,
  options jsonb not null,                 -- {"A":"..","B":"..","C":"..","D":".."}
  correct_answer text not null check (correct_answer in ('A','B','C','D')),
  explanation text not null default '',
  skill text,
  est_time_sec int not null default 60,
  source text,
  reviewer uuid references profiles(id),
  status question_status not null default 'draft',
  created_at timestamptz not null default now()
);
create index on questions (subject, topic, difficulty) where status = 'approved';

create table tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  kind attempt_kind not null default 'mock',
  duration_min int not null default 60,
  price_vnd int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table test_questions (
  test_id uuid references tests(id) on delete cascade,
  question_id uuid references questions(id) on delete restrict,
  position int not null,
  primary key (test_id, question_id)
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  test_id uuid references tests(id) on delete set null,
  kind attempt_kind not null,
  title text not null,
  question_ids uuid[] not null,
  answers jsonb not null default '{}',     -- {question_id: "A"}
  time_spent jsonb not null default '{}',  -- {question_id: seconds}
  duration_sec int not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score int,                               -- số câu đúng
  readiness int,                           -- 0-100
  breakdown jsonb,                         -- thống kê theo môn/chủ đề
  ai_report jsonb
);
create index on attempts (user_id, started_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,               -- nội dung chuyển khoản
  user_id uuid not null references profiles(id) on delete cascade,
  test_id uuid not null references tests(id),
  amount_vnd int not null,
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- tự tạo profile khi đăng ký
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone, audience)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name',''),
          new.raw_user_meta_data->>'phone',
          new.raw_user_meta_data->>'audience');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- RLS: dữ liệu nhạy cảm (đáp án) chỉ truy cập qua service role ở server.
alter table profiles enable row level security;
alter table questions enable row level security;
alter table tests enable row level security;
alter table test_questions enable row level security;
alter table attempts enable row level security;
alter table orders enable row level security;

create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "published tests read" on tests for select using (is_published);
create policy "own attempts read" on attempts for select using (auth.uid() = user_id);
create policy "own orders read" on orders for select using (auth.uid() = user_id);
-- questions / test_questions: không có policy => chỉ service role đọc/ghi.
-- Mọi ghi dữ liệu đi qua server actions (service role) sau khi kiểm tra quyền.
