import { SUBJECTS, type Subject } from "@/lib/constants";
import type { SkillProfile } from "@/lib/skills";

export function SubjectBars({ profile }: { profile: SkillProfile }) {
  return (
    <div className="space-y-3">
      {(Object.keys(SUBJECTS) as Subject[]).map((s) => {
        const v = profile.bySubject[s];
        return (
          <div key={s}>
            <div className="flex justify-between text-sm"><span className="font-medium">{SUBJECTS[s]}</span><span className="text-muted">{v.total ? `${v.correct}/${v.total} · ${v.pct}%` : "Chưa có dữ liệu"}</span></div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${v.pct >= 70 ? "bg-emerald-500" : v.pct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${v.pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function TopicHeat({ topics }: { topics: SkillProfile["topics"] }) {
  if (!topics.length) return <p className="text-sm text-muted">Làm một bài thi để xem bản đồ kỹ năng theo chủ đề.</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {topics.map((t) => (
        <div key={t.subject + t.topic} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${t.pct >= 70 ? "bg-success-bg text-success" : t.pct >= 50 ? "bg-warning-bg text-amber-700" : "bg-danger-bg text-red-600"}`}>{t.pct}%</span>
          <div className="min-w-0"><p className="truncate font-semibold">{t.topic}</p><p className="text-xs text-muted">{SUBJECTS[t.subject]} · {t.correct}/{t.total} câu</p></div>
        </div>
      ))}
    </div>
  );
}
