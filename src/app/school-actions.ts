"use server";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/auth";
import { adminDb } from "@/lib/supabase/admin";

export async function consultAction(schoolId: string | null, fd: FormData) {
  const me = await requireMe(schoolId ? `/truong/${schoolId}` : "/truong");
  const phone = String(fd.get("phone") ?? "").trim().slice(0, 30);
  const message = String(fd.get("message") ?? "").trim().slice(0, 1000);
  if (phone.length < 8) redirect(`${schoolId ? `/truong/${schoolId}` : "/truong"}?consult=invalid#tu-van`);
  let sid: string | null = null;
  if (schoolId) { const { data } = await adminDb().from("schools").select("id").eq("id", schoolId).maybeSingle(); sid = data?.id ?? null; }
  await adminDb().from("consultations").insert({ user_id: me.id, school_id: sid, phone, message });
  redirect(`${schoolId ? `/truong/${schoolId}` : "/truong"}?consult=ok#tu-van`);
}
