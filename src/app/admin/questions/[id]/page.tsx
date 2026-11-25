import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { DIFFICULTY, LANGUAGES, STATUS_LABEL, SUBJECTS } from "@/lib/constants";
import { saveQuestion } from "../../actions";
import { inScope, subjectScope } from "@/lib/reviewer";
import { QuestionEditor } from "@/components/admin/QuestionEditor";

export const metadata = { title: "Sửa câu hỏi – Quản trị" };

type T = { body?: string; options?: Record<string, string>; explanation?: string };
const content = (t: T | undefined) => ({
  body: t?.body ?? "",
  options: { A: t?.options?.A ?? "", B: t?.options?.B ?? "", C: t?.options?.C ?? "", D: t?.options?.D ?? "" },
  explanation: t?.explanation ?? "",
});
/** Chỉ quay về trang trong khu quản trị. */
const safeBack = (b: string | undefined) => (b && b.startsWith("/admin/") && !b.startsWith("//") ? b : "/admin/questions");

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; back?: string }> }) {
  const me = await requireAdmin("questions");
  const { id } = await params;
  const { error, back } = await searchParams;
  const isNew = id === "new";
  const { data: q } = isNew ? { data: null } : await adminDb().from("questions").select("*").eq("id", id).single();
  if (!isNew && !q) notFound();
  const scope = await subjectScope(me);
  if (q && !inScope(scope, q.subject)) notFound();
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const subjects = Object.fromEntries(Object.entries(SUBJECTS).filter(([k]) => inScope(scope, k)));
  const statuses = Object.fromEntries(Object.entries(STATUS_LABEL).filter(([k]) => k !== "rejected" && (canApprove || k !== "approved")));
  const tr = (q?.translations ?? {}) as Record<string, T>;

  return (
    <QuestionEditor
      action={saveQuestion.bind(null, isNew ? null : id)}
      isNew={isNew}
      back={safeBack(back)}
      error={!!error}
      meta={{
        subject: q?.subject ?? Object.keys(subjects)[0] ?? "math", topic: q?.topic ?? "", difficulty: q?.difficulty ?? "medium", language: q?.language ?? "vi",
        skill: q?.skill ?? "", source: q?.source ?? "", est_time_sec: q?.est_time_sec ?? 60,
        status: q && q.status !== "rejected" ? q.status : "draft", correct: (["A", "B", "C", "D"].includes(q?.correct_answer) ? q!.correct_answer : "A") as "A" | "B" | "C" | "D",
      }}
      content={{ vi: content(q ? { body: q.body, options: q.options, explanation: q.explanation } : undefined), en: content(tr.en), zh: content(tr.zh) }}
      choices={{ subjects, difficulty: DIFFICULTY, languages: LANGUAGES, statuses }}
    />
  );
}
