// Build + deploy lên Cloudflare mà KHÔNG nhúng khóa bí mật vào mã Worker.
// OpenNext đọc mọi file .env* và ghi giá trị vào bundle; vì vậy tạm gỡ .env.local,
// chỉ cho build thấy các biến NEXT_PUBLIC_* (công khai). Khóa bí mật lấy từ Cloudflare Secrets
// (đặt bằng: npx wrangler secret put <TÊN>).
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const LOCAL = ".env.local", BAK = ".env.local.bak", PROD = ".env.production";
const publicVars = existsSync(LOCAL)
  ? readFileSync(LOCAL, "utf8").split("\n").filter((l) => /^NEXT_PUBLIC_[A-Z0-9_]+=/.test(l))
  : [];
const hadProd = existsSync(PROD);
if (hadProd) renameSync(PROD, PROD + ".bak");
if (existsSync(LOCAL)) renameSync(LOCAL, BAK);
writeFileSync(PROD, publicVars.join("\n") + "\n");

let code = 1;
try {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (/^(SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|PAYMENT_WEBHOOK_KEY)$/.test(k)) delete env[k];
  for (const args of [["build"], ["deploy"]]) {
    const r = spawnSync("npx", ["opennextjs-cloudflare", ...args], { stdio: "inherit", env });
    if (r.status !== 0) { code = r.status ?? 1; throw new Error(`opennextjs-cloudflare ${args[0]} failed`); }
  }
  code = 0;
} catch (e) {
  console.error(String(e));
} finally {
  rmSync(PROD, { force: true });
  if (existsSync(BAK)) renameSync(BAK, LOCAL);
  if (hadProd) renameSync(PROD + ".bak", PROD);
}
process.exit(code);
