-- ĐỢT 0: ngân hàng câu hỏi 3 ngôn ngữ, truy vết nguồn, kiểm tra tự động, blueprint

alter table questions
  add column translations jsonb not null default '{}',   -- {"en":{"body","options","explanation"},"zh":{...}}; bản gốc (vi) nằm ở các cột chính
  add column origin text not null default 'teacher' check (origin in ('ai_generated','teacher','open_source')),
  add column source_license text,
  add column batch_id text,
  add column verify_status text not null default 'unchecked' check (verify_status in ('unchecked','pass','mismatch','invalid')),
  add column verify_note text,
  add column similar_to uuid references questions(id) on delete set null,
  add column review_note text,
  add column reviewed_at timestamptz;
create index on questions (status, verify_status, subject);
create index on questions (batch_id);

alter table profiles add column lang text not null default 'vi' check (lang in ('vi','en','zh'));

create table blueprint (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('math','physics','chemistry','chinese')),
  topic text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  target_count int not null default 0 check (target_count >= 0),
  hints text not null default '',          -- gợi ý chủ đề con để đa dạng hóa
  unique (subject, topic, difficulty)
);
alter table blueprint enable row level security;   -- chỉ service role

create function admin_blueprint_progress()
returns table(subject text, topic text, difficulty text, target int, approved int, in_review int, rejected int, drafted int)
language sql stable as $$
  select b.subject, b.topic, b.difficulty, b.target_count,
    count(q.id) filter (where q.status = 'approved')::int,
    count(q.id) filter (where q.status = 'review')::int,
    count(q.id) filter (where q.status = 'rejected')::int,
    count(q.id) filter (where q.status = 'draft')::int
  from blueprint b
  left join questions q on q.subject = b.subject and q.topic = b.topic and q.difficulty = b.difficulty
  group by b.id order by b.subject, b.topic, b.difficulty
$$;
revoke execute on function admin_blueprint_progress() from public, anon, authenticated;
