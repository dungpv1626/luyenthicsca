-- Chạy riêng: thêm giá trị enum phải commit trước khi dùng.
alter type question_status add value if not exists 'rejected';
