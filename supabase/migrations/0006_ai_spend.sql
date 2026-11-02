-- Sổ chi tiêu API cho việc sinh câu hỏi (thực thi trần ngân sách)
create table ai_spend (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  label text not null,
  tokens_in bigint not null default 0,
  tokens_out bigint not null default 0,
  usd numeric(10,4) not null default 0,
  estimated boolean not null default false
);
alter table ai_spend enable row level security;   -- chỉ service role

-- Chi tiêu đã phát sinh trước khi có sổ (tính từ log, giá Claude Sonnet 5.5: $2 / $10 mỗi 1M token)
insert into ai_spend (label, tokens_in, tokens_out, usd, estimated) values
 ('Lô thử + chạy thử (4 lần)', 146971, 169998, 1.99, true),
 ('Đợt 2 (4 môn)', 648838, 1153787, 12.84, true),
 ('Đợt 2b (bù lô bị mất)', 167342, 327293, 3.61, true),
 ('Ước tính khác: kiểm tra lại, viết lại lời giải, kiểm thử báo cáo AI/lộ trình/gia sư trong app', 0, 0, 2.00, true);
