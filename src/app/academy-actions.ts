"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";
import { newOrderCode } from "@/lib/orders";

export async function buyCourseAction(courseId: string) {
  const me = await requireMe(`/academy/${courseId}`);
  const db = adminDb();
  const { data: c } = await db.from("courses").select("id, price_vnd").eq("id", courseId).eq("is_published", true).single();
  if (!c || c.price_vnd === 0) redirect(`/academy/${courseId}`);
  const { data: ex } = await db.from("orders").select("id").eq("user_id", me.id).eq("course_id", courseId).eq("status", "pending").limit(1);
  if (ex?.[0]) redirect(`/thanh-toan/${ex[0].id}`);
  const { data, error } = await db.from("orders").insert({ code: newOrderCode(), user_id: me.id, course_id: courseId, amount_vnd: c.price_vnd }).select("id").single();
  if (error) throw new Error(error.message);
  redirect(`/thanh-toan/${data.id}`);
}

export async function toggleLessonAction(lessonId: string, courseId: string, done: boolean) {
  const me = await requireMe(`/academy/${courseId}`);
  const db = adminDb();
  if (done) await db.from("lesson_progress").upsert({ user_id: me.id, lesson_id: lessonId });
  else await db.from("lesson_progress").delete().eq("user_id", me.id).eq("lesson_id", lessonId);
  revalidatePath(`/academy/${courseId}`);
}
