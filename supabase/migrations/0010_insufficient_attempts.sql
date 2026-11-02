-- Đánh dấu các bài đã nộp nhưng làm dưới 20% số câu là "không đủ dữ liệu" (không tính vào Readiness / tiến bộ)
update attempts
set breakdown = coalesce(breakdown, '{}'::jsonb) || '{"insufficient": true}'::jsonb
where submitted_at is not null
  and (select count(*) from jsonb_object_keys(answers)) < ceil(0.2 * coalesce(array_length(question_ids, 1), 0))
  and coalesce(array_length(question_ids, 1), 0) > 0;
