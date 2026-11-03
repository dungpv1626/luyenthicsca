-- Quy trình giáo viên duyệt: gán môn phụ trách + đánh dấu xác nhận theo mẫu thống kê
alter table profiles add column if not exists review_subjects text[] not null default '{}';
alter table questions add column if not exists confirmed_by_sample boolean not null default false;
create index if not exists questions_reviewer_idx on questions (reviewer, reviewed_at desc);
