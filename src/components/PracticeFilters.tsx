"use client";
import { useState } from "react";

type Mod = { key: string; name: string };

/** Bộ lọc luyện tập: chọn môn thì danh sách mô-đun đề cương và chủ đề chỉ còn của môn đó. */
export function PracticeFilters({ bySubject, subjects, difficulties, modules, defaultSubject = "", defaultModule = "" }: { bySubject: Record<string, string[]>; subjects: Record<string, string>; difficulties: Record<string, string>; modules: Record<string, Mod[]>; defaultSubject?: string; defaultModule?: string }) {
  const [subject, setSubject] = useState(defaultSubject in subjects ? defaultSubject : "");
  const topics = subject ? (bySubject[subject] ?? []) : [];
  const mods = subject ? (modules[subject] ?? []) : [];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="f-subject">Môn</label>
        <select id="f-subject" name="subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Tất cả các môn</option>{Object.entries(subjects).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div><label className="label" htmlFor="f-module">Mô-đun đề cương CSCA</label>
        <select id="f-module" name="module" className="input" disabled={!subject} key={`m-${subject}`} defaultValue={mods.some((m) => m.key === defaultModule) ? defaultModule : ""}><option value="">{subject ? "Tất cả mô-đun của môn" : "Chọn môn để lọc theo mô-đun"}</option>{mods.map((m) => <option key={m.key} value={m.key}>{m.name}</option>)}</select></div>
      <div><label className="label" htmlFor="f-topic">Chủ đề</label>
        <select id="f-topic" name="topic" className="input" disabled={!subject} key={`t-${subject}`} defaultValue=""><option value="">{subject ? "Tất cả chủ đề của môn" : "Chọn môn để lọc theo chủ đề"}</option>{topics.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
      <div><label className="label" htmlFor="f-difficulty">Độ khó</label>
        <select id="f-difficulty" name="difficulty" className="input"><option value="">Tất cả</option>{Object.entries(difficulties).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="f-count">Số câu</label>
        <select id="f-count" name="count" className="input sm:max-w-xs" defaultValue="10"><option>10</option><option>20</option><option>50</option></select></div>
    </div>
  );
}
