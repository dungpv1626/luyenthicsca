import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // www → tên miền chính (một địa chỉ duy nhất, tốt cho SEO và cookie đăng nhập)
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.luyenthicsca.edu.vn" }], destination: "https://luyenthicsca.edu.vn/:path*", permanent: true }];
  },
};

export default nextConfig;
