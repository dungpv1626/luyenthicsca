-- PHASE 2: AI Study Plan, AI Tutor, School/Scholarship DB, Academy, Analytics

-- ===== Trường & học bổng =====
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_zh text,
  city text,
  province text,
  kind text,                       -- công lập / tư thục / 985 / 211 ...
  website text,
  description text not null default '',
  majors text[] not null default '{}',
  csca_required boolean not null default true,
  -- Mức chuẩn tham khảo (% đúng theo từng môn) do đội ngũ nhập; null = chưa có dữ liệu
  req_math int check (req_math between 0 and 100),
  req_physics int check (req_physics between 0 and 100),
  req_chemistry int check (req_chemistry between 0 and 100),
  req_chinese int check (req_chinese between 0 and 100),
  requirement_note text not null default '',
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_id uuid references schools(id) on delete set null,
  provider text,
  coverage text not null default '',
  deadline date,
  requirements text not null default '',
  link text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create type lead_status as enum ('new','contacted','closed');
create table consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  school_id uuid references schools(id) on delete set null,
  phone text,
  message text not null default '',
  status lead_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ===== Academy =====
create table teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text,
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  teacher_id uuid references teachers(id) on delete set null,
  level text,
  price_vnd int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  position int not null default 0,
  title text not null,
  video_url text,
  content text not null default '',
  is_free_preview boolean not null default false,
  practice_subject text,           -- quiz cuối bài: luyện tập theo chủ đề
  practice_topic text,
  created_at timestamptz not null default now()
);
create index on lessons (course_id, position);

create table lesson_progress (
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  done_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- đơn hàng dùng chung cho đề thi và khóa học
alter table orders alter column test_id drop not null;
alter table orders add column course_id uuid references courses(id);
alter table orders add constraint orders_one_item check ((test_id is null) <> (course_id is null));

-- ===== AI Study Plan =====
create table study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  goal text not null default '',
  target_readiness int not null default 80,
  weeks int not null,
  minutes_per_day int not null default 60,
  summary text not null default '',
  source text not null default 'rule',
  active boolean not null default true,
  start_date date not null,
  created_at timestamptz not null default now()
);
create unique index one_active_plan on study_plans (user_id) where active;

create table plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references study_plans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  due_date date not null,
  title text not null,
  kind text not null check (kind in ('practice','review','mini_test','mock')),
  subject text,
  topic text,
  question_count int not null default 10,
  done_at timestamptz
);
create index on plan_tasks (user_id, due_date);

alter table attempts add column plan_task_id uuid references plan_tasks(id) on delete set null;
alter table attempts add column wrong_ids uuid[] not null default '{}';

-- ===== AI Tutor: giới hạn lượt hỏi mỗi ngày =====
create table tutor_usage (
  user_id uuid references profiles(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- ===== RLS =====
alter table schools enable row level security;
alter table scholarships enable row level security;
alter table consultations enable row level security;
alter table teachers enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table lesson_progress enable row level security;
alter table study_plans enable row level security;
alter table plan_tasks enable row level security;
alter table tutor_usage enable row level security;

create policy "public read schools" on schools for select using (true);
create policy "public read scholarships" on scholarships for select using (is_active);
create policy "public read teachers" on teachers for select using (true);
create policy "public read courses" on courses for select using (is_published);
create policy "own consultations" on consultations for select using (auth.uid() = user_id);
create policy "own progress" on lesson_progress for select using (auth.uid() = user_id);
create policy "own plans" on study_plans for select using (auth.uid() = user_id);
create policy "own tasks" on plan_tasks for select using (auth.uid() = user_id);
-- lessons (nội dung trả phí) và tutor_usage: không có policy => chỉ server (service role).

-- ===== Thống kê cho admin (chỉ service role gọi được) =====
create function admin_daily_stats(days int default 30)
returns table(day date, signups int, attempts int, revenue bigint)
language sql stable as $$
  select d::date,
    (select count(*) from profiles where created_at::date = d::date)::int,
    (select count(*) from attempts where submitted_at::date = d::date)::int,
    coalesce((select sum(amount_vnd) from orders where status = 'paid' and paid_at::date = d::date), 0)::bigint
  from generate_series(current_date - (days - 1), current_date, '1 day') d
  order by 1
$$;

create function admin_funnel()
returns table(signups int, took_test int, paid int, returned int)
language sql stable as $$
  select
    (select count(*) from profiles)::int,
    (select count(distinct user_id) from attempts where submitted_at is not null)::int,
    (select count(distinct user_id) from orders where status = 'paid')::int,
    (select count(*) from (select user_id from attempts where submitted_at is not null
       group by user_id having count(distinct submitted_at::date) >= 2) t)::int
$$;

create function admin_question_stats()
returns table(id uuid, subject text, topic text, difficulty text, shown int, correct int)
language sql stable as $$
  select q.id, q.subject, q.topic, q.difficulty,
    count(a.id)::int,
    count(a.id) filter (where a.answers ->> q.id::text = q.correct_answer)::int
  from questions q
  left join attempts a on a.submitted_at is not null and q.id = any(a.question_ids)
  where q.status = 'approved'
  group by q.id
$$;

revoke execute on function admin_daily_stats(int), admin_funnel(), admin_question_stats() from public, anon, authenticated;
