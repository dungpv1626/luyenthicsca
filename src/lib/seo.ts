/** Địa chỉ gốc dùng cho canonical, sitemap, Open Graph, JSON-LD: luôn là tên miền chính thức (không phụ thuộc biến môi trường lúc build). */
export const SITE_URL = "https://luyenthicsca.edu.vn";
export const SITE_NAME = "CSCA Việt Nam";
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
