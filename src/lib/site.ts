import { headers } from "next/headers";

/** Chỉ tin các host này khi dựng link trong email (chống giả mạo header Host). */
const ALLOWED_HOSTS = new Set([
  "luyenthicsca.edu.vn",
  "www.luyenthicsca.edu.vn",
  "luyenthicsca.automkt.workers.dev",
  "localhost:3000", "localhost:3111", "localhost:3112",
]);
const FALLBACK = "https://luyenthicsca.automkt.workers.dev";

export async function requestOrigin() {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) return FALLBACK;
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}
