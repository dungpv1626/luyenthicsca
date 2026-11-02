/** Chỉ cho phép ảnh nội bộ (/schools/xxx.jpg) hoặc https — tránh javascript:, data: … */
export const safeImageUrl = (u: string | null | undefined) => (u && (/^\/(?!\/)[\w\-./]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u)) ? u : null);
