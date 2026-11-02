-- Bộ đề theo cấp: cấp (1–4), phạm vi (tổng hợp / theo môn), số thứ tự đề
alter table tests
  add column level int check (level between 1 and 4),
  add column scope text not null default 'full' check (scope in ('full','subject')),
  add column subject text check (subject in ('math','physics','chemistry','chinese')),
  add column set_no int;
create index on tests (level, scope, subject);
