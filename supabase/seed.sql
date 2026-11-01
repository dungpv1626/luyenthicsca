-- Dữ liệu mẫu để chạy thử. Toàn bộ đã 'approved'. Thay bằng ngân hàng câu hỏi thật được giáo viên duyệt.
insert into questions (subject, topic, difficulty, language, body, options, correct_answer, explanation, skill, est_time_sec, status) values
('math','Đại số','easy','vi','Giải phương trình 2x + 6 = 14. Giá trị của x là:','{"A":"2","B":"4","C":"6","D":"10"}','B','2x = 14 − 6 = 8 nên x = 4.','Giải phương trình bậc nhất',45,'approved'),
('math','Đại số','medium','vi','Nếu x² − 5x + 6 = 0 thì tổng hai nghiệm bằng:','{"A":"−5","B":"5","C":"6","D":"−6"}','B','Theo Vi-ét, x1 + x2 = −b/a = 5.','Vi-ét',60,'approved'),
('math','Hàm số','easy','vi','Cho f(x) = 3x − 2. Giá trị f(4) là:','{"A":"10","B":"12","C":"14","D":"6"}','A','f(4) = 3·4 − 2 = 10.','Tính giá trị hàm số',40,'approved'),
('math','Hàm số','medium','vi','Hàm số y = x² − 4x + 3 đạt giá trị nhỏ nhất bằng:','{"A":"−1","B":"0","C":"1","D":"3"}','A','Đỉnh tại x = 2, y = 4 − 8 + 3 = −1.','Cực trị hàm bậc hai',70,'approved'),
('math','Hàm số','hard','vi','Số nghiệm thực của phương trình x³ − 3x + 1 = 0 là:','{"A":"0","B":"1","C":"2","D":"3"}','D','f(−2)<0, f(0)>0, f(1)<0, f(2)>0 nên có 3 nghiệm thực.','Khảo sát hàm số',120,'approved'),
('math','Xác suất','easy','vi','Gieo một con xúc xắc cân đối. Xác suất ra mặt chẵn là:','{"A":"1/6","B":"1/3","C":"1/2","D":"2/3"}','C','Có 3 mặt chẵn trong 6 mặt: 3/6 = 1/2.','Xác suất cơ bản',40,'approved'),
('math','Xác suất','medium','vi','Gieo hai đồng xu cân đối. Xác suất được ít nhất một mặt sấp là:','{"A":"1/4","B":"1/2","C":"3/4","D":"1"}','C','1 − P(cả hai ngửa) = 1 − 1/4 = 3/4.','Xác suất bù',60,'approved'),
('physics','Cơ học','easy','vi','Một vật chuyển động đều với v = 5 m/s trong 10 s. Quãng đường đi được là:','{"A":"2 m","B":"15 m","C":"50 m","D":"500 m"}','C','s = v·t = 5·10 = 50 m.','Chuyển động đều',45,'approved'),
('physics','Cơ học','medium','vi','Vật khối lượng 2 kg chịu lực hợp lực 6 N. Gia tốc của vật là:','{"A":"3 m/s²","B":"12 m/s²","C":"0,33 m/s²","D":"8 m/s²"}','A','a = F/m = 6/2 = 3 m/s².','Định luật II Newton',50,'approved'),
('physics','Cơ học','hard','vi','Vật ném thẳng đứng lên với v0 = 20 m/s, g = 10 m/s². Độ cao cực đại là:','{"A":"10 m","B":"20 m","C":"40 m","D":"200 m"}','B','h = v0²/(2g) = 400/20 = 20 m.','Chuyển động ném',80,'approved'),
('physics','Điện học','easy','vi','Định luật Ohm cho đoạn mạch được viết là:','{"A":"U = I/R","B":"I = U/R","C":"R = U·I","D":"I = U·R"}','B','Cường độ dòng điện tỉ lệ thuận với hiệu điện thế: I = U/R.','Định luật Ohm',30,'approved'),
('physics','Điện học','medium','vi','Điện trở R = 10 Ω, hiệu điện thế 20 V. Công suất tỏa nhiệt là:','{"A":"2 W","B":"20 W","C":"40 W","D":"200 W"}','C','P = U²/R = 400/10 = 40 W.','Công suất điện',60,'approved'),
('chemistry','Cấu tạo nguyên tử','easy','vi','Nguyên tử Natri (Na) có số hiệu nguyên tử 11. Số electron của nó là:','{"A":"1","B":"11","C":"12","D":"23"}','B','Số electron = số proton = số hiệu nguyên tử = 11.','Cấu tạo nguyên tử',30,'approved'),
('chemistry','Phản ứng hóa học','medium','vi','Cân bằng: H2 + O2 → H2O. Hệ số lần lượt là:','{"A":"1,1,1","B":"2,1,2","C":"1,2,2","D":"2,2,1"}','B','2H2 + O2 → 2H2O.','Cân bằng phương trình',50,'approved'),
('chemistry','Dung dịch','medium','vi','Hòa tan 0,2 mol NaOH vào nước được 0,5 lít dung dịch. Nồng độ mol là:','{"A":"0,1 M","B":"0,4 M","C":"0,2 M","D":"1 M"}','B','C = n/V = 0,2/0,5 = 0,4 M.','Nồng độ dung dịch',60,'approved'),
('chemistry','Phản ứng hóa học','hard','vi','Cho 5,6 g Fe tác dụng hết với dung dịch HCl dư (Fe + 2HCl → FeCl2 + H2). Thể tích H2 (đktc) là:','{"A":"1,12 L","B":"2,24 L","C":"4,48 L","D":"5,6 L"}','B','n(Fe) = 0,1 mol → n(H2) = 0,1 mol → V = 2,24 L.','Tính toán hóa học',90,'approved'),
('chinese','Từ vựng chuyên ngành','easy','zh','“函数” trong toán học có nghĩa là:','{"A":"Phương trình","B":"Hàm số","C":"Xác suất","D":"Đạo hàm"}','B','函数 (hánshù) = hàm số.','Từ vựng toán',30,'approved'),
('chinese','Từ vựng chuyên ngành','easy','zh','“速度” trong vật lý có nghĩa là:','{"A":"Vận tốc","B":"Lực","C":"Năng lượng","D":"Khối lượng"}','A','速度 (sùdù) = vận tốc.','Từ vựng vật lý',30,'approved'),
('chinese','Từ vựng chuyên ngành','medium','zh','“化学反应” có nghĩa là:','{"A":"Dung dịch","B":"Nguyên tử","C":"Phản ứng hóa học","D":"Nhiệt độ"}','C','化学反应 = phản ứng hóa học.','Từ vựng hóa',40,'approved'),
('chinese','Đọc hiểu','medium','zh','Chọn từ thích hợp: 这个实验的结果______我们的预期。','{"A":"符合","B":"符号","C":"服务","D":"复杂"}','A','“符合预期” = phù hợp với kỳ vọng.','Đọc hiểu học thuật',60,'approved');

insert into tests (title, description, kind, duration_min, price_vnd, is_published)
values ('Mock Test mẫu #1', 'Đề mẫu gồm 4 môn – dùng để thử luồng mua và làm bài.', 'mock', 30, 49000, true);

insert into test_questions (test_id, question_id, position)
select (select id from tests where title = 'Mock Test mẫu #1'), id, row_number() over (order by subject, difficulty)
from questions where status = 'approved';
