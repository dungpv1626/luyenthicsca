"use client";
import { useState } from "react";

/** Bộ lọc luyện tập: chọn môn thì danh sách chủ đề chỉ còn các chủ đề của môn đó. */
export function PracticeFilters({ bySubject, subjects, difficulties }: { bySubject: Record<string, string[]>; subjects: Record<string, string>; difficulties: Record<string, string> }) {
  const [subject, setSubject] = useState("");
  const list = subject ? (bySubject[subject] ?? []) : [];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="f-subject">Môn</label>
        <select id="f-subject" name="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Tất cả các môn</option>{Object.entries(subjects).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label className="label" htmlFor="f-topic">Chủ đề</label>
        <select id="f-topic" name="topic" className="input" disabled={!subject} key={subject} defaultValue=""><option value="">{subject ? "Tất cả chủ đề của môn" : "Chọn môn để lọc theo chủ đề"}</option>{list.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      <div><label className="label" htmlFor="f-difficulty">Độ khó</label>
        <select id="f-difficulty" name="difficulty" className="input"><option value="">Tất cả</option>{Object.entries(difficulties).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label className="label" htmlFor="f-count">Số câu</label>
        <select id="f-count" name="count" className="input" defaultValue="10"><option>10</option><option>20</option><option>50</option></select></div>
    </div>
  );
}
