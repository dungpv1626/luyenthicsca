-- Blog SEO: bài viết nhập từ kế hoạch 60 bài; mặc định là nháp, chỉ công bố sau khi người phụ trách duyệt
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,                 -- H1 hiển thị
  seo_title text not null,             -- thẻ <title>
  meta_description text not null,
  keyword text,
  keywords text[] not null default '{}',
  category text not null default 'Thông tin kỳ thi',
  body_md text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  publish_at timestamptz,              -- ngày công bố (lên lịch) / đã công bố
  planned_no int,                      -- số thứ tự trong kế hoạch 60 bài
  planned_for date,                    -- ngày đăng dự kiến theo kế hoạch
  replaces_path text,                  -- bài thay nội dung một trang có sẵn (vd /csca)
  source_file text,
  read_minutes int not null default 3,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on posts (status, publish_at);
alter table posts enable row level security;  -- chỉ service role (trang công khai đọc qua máy chủ)
