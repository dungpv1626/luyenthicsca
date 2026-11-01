-- Dữ liệu mẫu Phase 2. KHÔNG chứa mức chuẩn CSCA: cần đội ngũ nhập từ thông báo chính thức của từng trường.
insert into schools (name, name_zh, city, province, kind, website, description, requirement_note) values
('Đại học Thanh Hoa', '清华大学', 'Bắc Kinh', 'Bắc Kinh', 'Công lập', 'https://www.tsinghua.edu.cn', 'Đại học nghiên cứu hàng đầu của Trung Quốc, mạnh về khoa học kỹ thuật.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.'),
('Đại học Bắc Kinh', '北京大学', 'Bắc Kinh', 'Bắc Kinh', 'Công lập', 'https://www.pku.edu.cn', 'Đại học tổng hợp lâu đời, thế mạnh khoa học tự nhiên và nhân văn.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.'),
('Đại học Phục Đán', '复旦大学', 'Thượng Hải', 'Thượng Hải', 'Công lập', 'https://www.fudan.edu.cn', 'Đại học nghiên cứu tổng hợp tại Thượng Hải.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.'),
('Đại học Giao thông Thượng Hải', '上海交通大学', 'Thượng Hải', 'Thượng Hải', 'Công lập', 'https://www.sjtu.edu.cn', 'Đại học nghiên cứu mạnh về kỹ thuật và công nghệ.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.'),
('Đại học Chiết Giang', '浙江大学', 'Hàng Châu', 'Chiết Giang', 'Công lập', 'https://www.zju.edu.cn', 'Đại học tổng hợp lớn, nhiều ngành khoa học và kỹ thuật.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.'),
('Đại học Nam Kinh', '南京大学', 'Nam Kinh', 'Giang Tô', 'Công lập', 'https://www.nju.edu.cn', 'Đại học nghiên cứu tổng hợp tại Nam Kinh.', 'Yêu cầu CSCA đang được cập nhật. Vui lòng tham khảo thông báo tuyển sinh chính thức.');

insert into scholarships (name, provider, coverage, requirements, is_active) values
('Học bổng Chính phủ Trung Quốc (CSC)', 'Chính phủ Trung Quốc', 'Thường gồm học phí, chỗ ở, trợ cấp sinh hoạt và bảo hiểm – chi tiết theo thông báo chính thức từng năm.', 'Điều kiện, hạn nộp và hồ sơ thay đổi theo từng năm và từng trường. Hãy đối chiếu thông báo chính thức.', true);

insert into teachers (name, title, bio) values ('Giáo viên mẫu', 'Giảng viên', 'Hồ sơ giáo viên mẫu – thay bằng thông tin giáo viên thật.');

insert into courses (title, description, teacher_id, level, price_vnd, is_published)
values ('Làm quen CSCA (khóa mẫu)', 'Khóa mẫu miễn phí: cách dùng nền tảng và phương pháp ôn thi hiệu quả.', (select id from teachers limit 1), 'Mới bắt đầu', 0, true);

insert into lessons (course_id, position, title, content, is_free_preview, practice_subject, practice_topic)
select c.id, p.pos, p.title, p.content, true, p.ps, p.pt from courses c, (values
 (1, 'Cách ôn thi hiệu quả với Readiness Score', E'1. Làm Quick Test để biết điểm xuất phát.\n2. Xem báo cáo AI: chủ đề nào yếu nhất.\n3. Tạo lộ trình học và làm nhiệm vụ mỗi ngày.\n4. Thi lại sau 1–2 tuần để so sánh tiến bộ.', 'math', 'Đại số'),
 (2, 'Học từ câu sai', E'Mỗi câu sai là một chỗ hổng kiến thức.\n- Đọc giải thích.\n- Hỏi Gia sư AI nếu chưa hiểu.\n- Làm lại ở mục "Câu đã sai" sau vài ngày.', null, null)
) as p(pos, title, content, ps, pt) where c.title = 'Làm quen CSCA (khóa mẫu)';
