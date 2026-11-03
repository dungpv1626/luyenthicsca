import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/thi/", "/ket-qua/", "/dashboard", "/thanh-toan", "/don-hang", "/doi-mat-khau", "/dat-lai-mat-khau", "/auth"] }], sitemap: abs("/sitemap.xml") };
}
