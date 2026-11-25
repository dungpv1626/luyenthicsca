"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { safeImageUrl } from "@/lib/school-image";
import { adminDb } from "@/lib/supabase/admin";
import { markOrderPaid } from "@/lib/orders";
import { pickQuestions } from "@/lib/exam";
import { SUBJECT_KEYS, ROLES, type Role, type Subject } from "@/lib/constants";
import { inScope, loadLots, reviewSubjectsOf, subjectScope } from "@/lib/reviewer";
import { parseLotKey } from "@/lib/batch-sample";
import { TEMPLATES } from "@/lib/templates/index.ts";

const pick = <T extends string>(v: FormDataEntryValue | null, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);

export async function saveQuestion(id: string | null, fd: FormData) {
  const me = await requireAdmin("questions");
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  let status = pick(fd.get("status"), ["draft", "review", "approved"] as const, "draft");
  if (status === "approved" && !canApprove) status = "review"; // chỉ người review mới được duyệt

  const row = {
    subject: pick(fd.get("subject"), SUBJECT_KEYS, "math"),
    topic: String(fd.get("topic") ?? "").trim(),
    difficulty: pick(fd.get("difficulty"), ["easy", "medium", "hard"] as const, "medium"),
    language: pick(fd.get("language"), ["vi", "en", "zh"] as const, "vi"),
    body: String(fd.get("body") ?? "").trim(),
    options: Object.fromEntries((["A", "B", "C", "D"] as const).map((k) => [k, String(fd.get(`opt_${k}`) ?? "").trim()])),
    correct_answer: pick(fd.get("correct_answer"), ["A", "B", "C", "D"] as const, "A"),
    explanation: String(fd.get("explanation") ?? "").trim(),
    skill: String(fd.get("skill") ?? "").trim() || null,
    est_time_sec: Math.max(10, Number(fd.get("est_time_sec")) || 60),
    source: String(fd.get("source") ?? "").trim() || null,
    status,
    reviewer: status === "approved" ? me.id : null,
    translations: Object.fromEntries((["en", "zh"] as const).flatMap((lg) => {
      const body = String(fd.get(`tr_${lg}_body`) ?? "").trim();
      if (!body) return [];
      return [[lg, {
        body,
        options: Object.fromEntries((["A", "B", "C", "D"] as const).map((k) => [k, String(fd.get(`tr_${lg}_opt_${k}`) ?? "").trim()])),
        explanation: String(fd.get(`tr_${lg}_explanation`) ?? "").trim(),
      }]];
    })),
  };
  if (!row.topic || !row.body || Object.values(row.options).some((o) => !o)) redirect(`/admin/questions/${id ?? "new"}?error=1`);

  const db = adminDb();
  // Giáo viên chỉ sửa/tạo câu thuộc môn mình phụ trách (cả môn cũ lẫn môn mới của câu).
  const scope = await subjectScope(me);
  const old = id ? (await db.from("questions").select("subject").eq("id", id).single()).data : null;
  if (!inScope(scope, row.subject) || (old && !inScope(scope, old.subject))) redirect("/admin/questions");
  const { error } = id ? await db.from("questions").update(row).eq("id", id) : await db.from("questions").insert(row);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function setQuestionStatus(id: string, status: "draft" | "review" | "approved") {
  const me = await requireAdmin("questions");
  if (status === "approved" && me.role !== "super_admin" && me.role !== "academic_reviewer") return;
  const scope = await subjectScope(me);
  const q = adminDb().from("questions").update({ status, reviewer: status === "approved" ? me.id : null }).eq("id", id);
  await (scope ? q.in("subject", scope) : q);
  revalidatePath("/admin/questions");
}

/** Đổi trạng thái hàng loạt cho các câu đã tích (tối đa 100 câu một lần). */
export async function bulkSetQuestionStatus(fd: FormData) {
  const me = await requireAdmin("questions");
  const status = String(fd.get("status") ?? "");
  if (status !== "review" && status !== "approved") return;
  if (status === "approved" && me.role !== "super_admin" && me.role !== "academic_reviewer") return;
  const ids = fd.getAll("ids").map(String).filter(Boolean).slice(0, 100);
  if (!ids.length) return;
  // Chỉ chuyển nháp -> chờ duyệt, hoặc chưa duyệt -> đã duyệt; không đụng vào câu đã duyệt.
  const scope = await subjectScope(me);
  const base = adminDb().from("questions").update({ status, reviewer: status === "approved" ? me.id : null }).in("id", ids);
  const q = scope ? base.in("subject", scope) : base;
  await (status === "review" ? q.eq("status", "draft") : q.neq("status", "approved"));
  revalidatePath("/admin/questions");
}

export async function createTest(fd: FormData) {
  await requireAdmin("tests");
  const db = adminDb();
  const perSubject = Object.fromEntries(SUBJECT_KEYS.map((s) => [s, Math.max(0, Math.min(100, Number(fd.get(`n_${s}`)) || 0))])) as Record<Subject, number>;
  const ids: string[] = [];
  for (const s of SUBJECT_KEYS) if (perSubject[s]) ids.push(...(await pickQuestions({ subjects: [s], count: perSubject[s] })));
  if (!ids.length) redirect("/admin/tests?error=empty");

  const { data: t, error } = await db.from("tests").insert({
    title: String(fd.get("title") ?? "").trim() || "Mock Test",
    description: String(fd.get("description") ?? "").trim(),
    kind: "mock",
    duration_min: Math.max(5, Number(fd.get("duration_min")) || 60),
    price_vnd: Math.max(0, Number(fd.get("price_vnd")) || 0),
  }).select("id").single();
  if (error) throw new Error(error.message);
  await db.from("test_questions").insert(ids.map((question_id, i) => ({ test_id: t.id, question_id, position: i })));
  revalidatePath("/admin/tests");
}

export async function togglePublish(id: string, publish: boolean) {
  await requireAdmin("tests");
  await adminDb().from("tests").update({ is_published: publish }).eq("id", id);
  revalidatePath("/admin/tests");
}

export async function confirmOrder(id: string) {
  await requireAdmin("orders");
  await markOrderPaid({ id });
  revalidatePath("/admin/orders");
}

export async function setOrderStatus(id: string, status: "cancelled" | "refunded") {
  await requireAdmin("orders");
  await adminDb().from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}

export async function setUserRole(userId: string, fd: FormData) {
  const me = await requireAdmin("users");
  if (me.role !== "super_admin") return; // chỉ Super Admin đổi vai trò
  const role = pick(fd.get("role"), Object.keys(ROLES) as Role[], "student");
  if (userId === me.id) return; // tránh tự hạ quyền
  await adminDb().from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

// ===== CRUD dùng chung cho Phase 2 (trường, học bổng, giáo viên, khóa học, bài giảng) =====
import { RESOURCES } from "@/lib/admin-resources";

export async function saveResource(key: string, id: string | null, fd: FormData) {
  const res = RESOURCES[key];
  if (!res) throw new Error("Resource không hợp lệ");
  await requireAdmin(res.area);
  const row: Record<string, unknown> = {};
  for (const f of res.fields) {
    const raw = fd.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "checkbox": row[f.name] = raw === "on"; break;
      case "number": row[f.name] = str === "" ? (f.nullable ? null : 0) : Math.min(f.max ?? 1e9, Math.max(f.min ?? -1e9, Math.round(Number(str)) || 0)); break;
      case "tags": row[f.name] = str.split(",").map((t) => t.trim()).filter(Boolean); break;
      case "date": row[f.name] = /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null; break;
      case "ref": row[f.name] = /^[0-9a-f-]{36}$/.test(str) ? str : null; break;
      case "select": row[f.name] = f.options && str in f.options && str !== "" ? str : null; break;
      default: row[f.name] = str === "" ? (f.nullable ? null : "") : str;
    }
    if (f.required && (row[f.name] === null || row[f.name] === "")) redirect(`/admin/data/${key}/${id ?? "new"}?error=1`);
  }
  if ("image_url" in row) { const u = safeImageUrl(row.image_url as string | null); if (row.image_url && !u) redirect(`/admin/data/${key}/${id ?? "new"}?error=1`); row.image_url = u; }
  const db = adminDb();
  const { error } = id ? await db.from(res.table).update(row).eq("id", id) : await db.from(res.table).insert(row);
  if (error) redirect(`/admin/data/${key}/${id ?? "new"}?error=1`);
  revalidatePath(`/admin/data/${key}`);
  redirect(`/admin/data/${key}`);
}

export async function deleteResource(key: string, id: string) {
  const res = RESOURCES[key];
  if (!res) return;
  await requireAdmin(res.area);
  await adminDb().from(res.table).delete().eq("id", id);
  revalidatePath(`/admin/data/${key}`);
  redirect(`/admin/data/${key}`);
}

export async function setLeadStatus(id: string, status: "new" | "contacted" | "closed") {
  await requireAdmin("leads");
  await adminDb().from("consultations").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

// ===== Duyệt câu hỏi (giáo viên) =====
export async function reviewQuestionAction(id: string, next: string, fd: FormData) {
  const me = await requireAdmin("questions");
  const decision = String(fd.get("decision"));
  const note = String(fd.get("note") ?? "").trim().slice(0, 500);
  const canApprove = me.role === "super_admin" || me.role === "academic_reviewer";
  const db = adminDb();
  const now = new Date().toISOString();
  // giáo viên chỉ duyệt môn được gán (nếu có gán)
  if (me.role === "academic_reviewer") {
    const mine = await reviewSubjectsOf(me.id);
    if (mine.length) {
      const { data: qq } = await db.from("questions").select("subject").eq("id", id).single();
      if (!qq || !mine.includes(qq.subject)) redirect(`${next}${next.includes("?") ? "&" : "?"}not_mine=1`);
    }
  }
  if (decision === "approve" && canApprove) {
    // xác nhận: câu chờ duyệt → công bố; câu đang hiển thị (tự công bố, hoặc đã xác nhận nhưng bị báo lỗi lại) → ghi nhận giáo viên đã xem.
    // reviewed_at mới làm các lượt báo lỗi trước đó được coi là đã xử lý.
    await db.from("questions").update({ status: "approved", auto_published: false, confirmed_by_sample: false, reviewer: me.id, review_note: note || null, reviewed_at: now }).eq("id", id).in("status", ["review", "approved"]);
  } else if (decision === "reject") {
    if (!note) redirect(`${next}${next.includes("?") ? "&" : "?"}need_note=1`);
    // loại / tắt câu hỏi (kể cả câu đang công bố): học sinh sẽ không thấy nữa
    await db.from("questions").update({ status: "rejected", auto_published: false, reviewer: me.id, review_note: note, reviewed_at: now }).eq("id", id).neq("status", "rejected");
  }
  revalidatePath("/admin/review");
  redirect(next.startsWith("/admin/review") ? next : "/admin/review");
}

/** Kiểm tra quyền với một lô (lô × môn): giáo viên duyệt / quản trị cấp cao, đúng môn phụ trách. Trả về trạng thái lô tính lại ở server. */
async function lotGuard(key: string) {
  const back = "/admin/review?view=lots";
  const me = await requireAdmin("questions");
  const lot = parseLotKey(key);
  if (!lot || (me.role !== "super_admin" && me.role !== "academic_reviewer") || !inScope(await subjectScope(me), lot.subject)) redirect(back);
  const [state] = await loadLots(null, lot);
  if (!state) redirect(back);
  return { me, lot, state, back };
}

/** Kết luận lô đạt: chỉ khi đã xem hết câu mẫu ngẫu nhiên và không loại câu nào. Các câu còn lại được đánh dấu "đạt kiểm tra mẫu". */
export async function confirmLotAction(key: string) {
  const { me, lot, state, back } = await lotGuard(key);
  if (state.status !== "passed") redirect(back);
  await adminDb().from("questions").update({ auto_published: false, confirmed_by_sample: true, reviewer: me.id, review_note: `Đạt kiểm tra mẫu (${state.sample.length} câu ngẫu nhiên, không lỗi)`, reviewed_at: new Date().toISOString() })
    .eq("batch_id", lot.batch).eq("subject", lot.subject).eq("origin", "ai_generated").eq("status", "approved").eq("auto_published", true);
  revalidatePath("/admin", "layout");
  redirect(`${back}&ok=passed`);
}

/** Lô không đạt (hoặc nghi có lỗi chung): đưa các câu chưa được giáo viên xem về hàng chờ duyệt để xem từng câu. Học viên không thấy các câu này nữa. */
export async function returnLotAction(key: string) {
  const { lot, back } = await lotGuard(key);
  await adminDb().from("questions").update({ status: "review", auto_published: false, review_note: "Lô không đạt kiểm tra mẫu: xem từng câu" })
    .eq("batch_id", lot.batch).eq("subject", lot.subject).eq("origin", "ai_generated").eq("status", "approved").eq("auto_published", true);
  revalidatePath("/admin", "layout");
  redirect(`${back}&ok=returned`);
}

/** Super Admin gán môn phụ trách cho giáo viên duyệt (rỗng = mọi môn). */
export async function setReviewSubjects(userId: string, fd: FormData) {
  const me = await requireAdmin("users");
  if (me.role !== "super_admin") return;
  const subjects = fd.getAll("subjects").map(String).filter((s) => (SUBJECT_KEYS as readonly string[]).includes(s));
  await adminDb().from("profiles").update({ review_subjects: subjects }).eq("id", userId);
  revalidatePath("/admin/users");
}

// ===== Bộ đề theo mức luyện tập =====
import { buildSets, type Q } from "@/lib/assemble";
import { LEVELS, SCOPE_LABEL, SET_DEFAULTS } from "@/lib/levels";

export async function createLevelSets(fd: FormData) {
  await requireAdmin("tests");
  const level = Math.min(4, Math.max(1, Math.round(Number(fd.get("level")) || 1)));
  const info = LEVELS[level - 1];
  const scope = fd.get("scope") === "subject" ? "subject" : "full";
  const subject = scope === "subject" ? pick(fd.get("subject"), SUBJECT_KEYS, "math") : null;
  const count = Math.min(10, Math.max(1, Math.round(Number(fd.get("count")) || 1)));
  const perSubject = Math.min(60, Math.max(3, Math.round(Number(fd.get("per_subject")) || SET_DEFAULTS[scope].perSubject)));
  const minutes = Math.min(300, Math.max(5, Math.round(Number(fd.get("minutes")) || SET_DEFAULTS[scope].minutes)));
  const price = Math.max(0, Math.round(Number(fd.get("price")) || 0));
  const publish = fd.get("publish") === "on";
  const relaxed = fd.get("relaxed") === "on";
  const back = (q: string) => redirect(`/admin/levels?${q}`);

  const db = adminDb();
  const subjects = scope === "full" ? [...SUBJECT_KEYS] : [subject as Subject];
  const { data: qs } = await db.from("questions").select("id, subject, topic, difficulty").eq("status", "approved").in("subject", subjects);
  const pools: Record<string, Q[]> = {};
  for (const q of (qs ?? []) as Q[]) (pools[q.subject] ??= []).push(q);

  // các câu đã nằm trong đề cùng cấp / phạm vi / môn → tránh trùng
  let tq = db.from("tests").select("id, set_no").eq("level", level).eq("scope", scope);
  tq = subject ? tq.eq("subject", subject) : tq.is("subject", null);
  const { data: existing } = await tq;
  const ids = (existing ?? []).map((t) => t.id);
  const { data: usedRows } = ids.length ? await db.from("test_questions").select("question_id").in("test_id", ids) : { data: [] as { question_id: string }[] };
  const usedSet = new Set((usedRows ?? []).map((r) => r.question_id));

  const built = buildSets(pools, subjects, count, perSubject, info.mix, usedSet, { relaxed });
  if (!built.sets.length) {
    const miss = built.shortages.map((s) => `${SUBJECTS_VI[s.subject] ?? s.subject}: thiếu ${s.missing} câu`).join("; ");
    back(`error=${encodeURIComponent(`Không đủ câu đã duyệt đúng cơ cấu cho Mức ${level}. ${miss || "Chưa có câu hỏi đã duyệt."} Hãy duyệt thêm câu hỏi hoặc bật "cho phép bù độ khó/trùng câu".`)}`);
  }

  let no = Math.max(0, ...(existing ?? []).map((t) => t.set_no ?? 0));
  let warn = 0;
  for (const s of built.sets) {
    no++;
    const title = `Mức ${level} · ${info.name} · ${scope === "full" ? "Tổng hợp" : SUBJECTS_VI[subject as string]} · Đề ${no}`;
    const { data: t, error } = await db.from("tests").insert({
      title, kind: "mock", level, scope, subject, set_no: no, duration_min: minutes, price_vnd: price, is_published: publish,
      description: `${s.ids.length} câu · ${info.tagline}.`,
    }).select("id").single();
    if (error) back(`error=${encodeURIComponent("Lỗi tạo đề: " + error.message)}`);
    await db.from("test_questions").insert(s.ids.map((question_id, i) => ({ test_id: t!.id, question_id, position: i })));
    warn += s.shifted + s.overlapped;
  }
  revalidatePath("/admin/levels"); revalidatePath("/thi-thu");
  const short = built.sets.length < count ? `&partial=${built.sets.length}of${count}` : "";
  back(`ok=${built.sets.length}${short}${warn ? `&warn=${warn}` : ""}`);
}
const SUBJECTS_VI: Record<string, string> = { math: "Toán", physics: "Vật lý", chemistry: "Hóa học", chinese: "Professional Chinese" };

// ===== Duyệt KHUÔN câu hỏi tham số (duyệt một khuôn = duyệt toàn bộ biến thể của nó) =====
/** Trang quay về sau thao tác với khuôn: chỉ chấp nhận đường dẫn trong /admin/templates. */
const templatesBack = (fd: FormData) => {
  const b = String(fd.get("back") ?? "");
  return b.startsWith("/admin/templates") && !b.includes("//") ? b : "/admin/templates";
};
const withMsg = (url: string, msg: string) => {
  const u = new URL(url, "http://x");
  u.searchParams.delete("ok"); u.searchParams.delete("error");
  for (const [k, v] of new URLSearchParams(msg)) u.searchParams.set(k, v);
  return u.pathname + u.search;
};

/** Kiểm tra quyền duyệt khuôn: giáo viên duyệt / quản trị cấp cao, và khuôn thuộc môn được phân công. */
async function templateGuard(key: string, back: string) {
  const me = await requireAdmin("questions");
  if (me.role !== "super_admin" && me.role !== "academic_reviewer") redirect(withMsg(back, "error=" + encodeURIComponent("Chỉ giáo viên duyệt / quản trị cấp cao mới duyệt được khuôn.")));
  const tpl = TEMPLATES.find((t) => t.key === key);
  if (!tpl || !inScope(await subjectScope(me), tpl.subject)) redirect(withMsg(back, "error=" + encodeURIComponent("Khuôn này không thuộc môn bạn phụ trách.")));
  return me;
}

export async function reviewTemplateAction(key: string, fd: FormData) {
  const back = templatesBack(fd);
  const me = await templateGuard(key, back);
  const decision = String(fd.get("decision"));
  const note = String(fd.get("note") ?? "").trim().slice(0, 500);
  const db = adminDb();
  const now = new Date().toISOString();
  if (decision === "approve") {
    await db.from("template_reviews").upsert({ template_key: key, status: "approved", reviewer: me.id, note: note || null, reviewed_at: now });
    await db.from("questions").update({ status: "approved", auto_published: false, reviewer: me.id, review_note: note || "Giáo viên xác nhận khuôn", reviewed_at: now }).eq("template_key", key).neq("status", "rejected");
  } else if (decision === "reject") {
    if (!note) redirect(withMsg(back, "error=" + encodeURIComponent("Cần ghi lý do khi loại khuôn.")));
    await db.from("template_reviews").upsert({ template_key: key, status: "rejected", reviewer: me.id, note, reviewed_at: now });
    await db.from("questions").update({ status: "rejected", auto_published: false, reviewer: me.id, review_note: `Loại khuôn: ${note}`, reviewed_at: now }).eq("template_key", key).neq("status", "rejected");
  }
  revalidatePath("/admin/templates", "layout");
  revalidatePath("/admin/review");
  redirect(withMsg(back, "ok=1"));
}

/** Gỡ một biến thể lẻ (giá trị lạ, đề vô lý…) mà không loại cả khuôn. Duyệt khuôn sau đó không bật lại câu đã gỡ. */
export async function removeVariantAction(key: string, id: string, fd: FormData) {
  const back = templatesBack(fd);
  const me = await templateGuard(key, back);
  const note = String(fd.get("note") ?? "").trim().slice(0, 300);
  await adminDb().from("questions").update({ status: "rejected", auto_published: false, reviewer: me.id, review_note: `Gỡ biến thể: ${note || "giá trị không hợp lý"}`, reviewed_at: new Date().toISOString() }).eq("id", id).eq("template_key", key);
  revalidatePath("/admin/templates", "layout");
  redirect(withMsg(back, "ok=removed"));
}

/** Đưa biến thể đã gỡ trở lại: theo trạng thái khuôn (khuôn đã duyệt → đã xác nhận; chưa → hiển thị chờ xác nhận). */
export async function restoreVariantAction(key: string, id: string, fd: FormData) {
  const back = templatesBack(fd);
  const me = await templateGuard(key, back);
  const db = adminDb();
  const { data: tr } = await db.from("template_reviews").select("status").eq("template_key", key).maybeSingle();
  if (tr?.status === "rejected") redirect(withMsg(back, "error=" + encodeURIComponent("Khuôn đang bị loại: hãy duyệt lại khuôn trước.")));
  const confirmed = tr?.status === "approved";
  await db.from("questions").update({ status: "approved", auto_published: !confirmed, reviewer: confirmed ? me.id : null, review_note: null, reviewed_at: confirmed ? new Date().toISOString() : null }).eq("id", id).eq("template_key", key);
  revalidatePath("/admin/templates", "layout");
  redirect(withMsg(back, "ok=restored"));
}
