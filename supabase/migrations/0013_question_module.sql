-- Mô-đun theo đề cương CSCA (xem src/lib/syllabus.ts): khóa mô-đun, 'out' = ngoài phần liệt kê của đề cương, null = chưa phân loại
alter table questions add column if not exists module text;
create index if not exists questions_subject_module_idx on questions (subject, module) where status = 'approved';
